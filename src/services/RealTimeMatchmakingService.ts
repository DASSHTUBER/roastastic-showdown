
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { DebugLogger } from './matchmaking/DebugLogger';
import { User } from './matchmaking/types';
import { BotMatchService } from './matchmaking/BotMatchService';
import { ChannelManager } from './matchmaking/ChannelManager';
import { PresenceHandler } from './matchmaking/PresenceHandler';

export class RealTimeMatchmakingService {
  private static instance: RealTimeMatchmakingService;
  private isInitialized: boolean = false;
  private matchmakingQueue: string[] = [];
  private battleRooms: { [userId: string]: string } = {};
  private userListeners: { [userId: string]: (opponent: User | null) => void } = {};
  private botMatchService: BotMatchService;
  private channelManager: ChannelManager;
  private presenceHandler: PresenceHandler;
  private currentUserId: string | null = null;
  private mainChannel: RealtimeChannel | null = null;
  private matchmakingInterval: number | null = null;
  private presenceInterval: number | null = null;
  
  private constructor() {
    this.botMatchService = new BotMatchService();
    this.channelManager = new ChannelManager();
    this.presenceHandler = new PresenceHandler();
  }

  // Singleton pattern
  public static getInstance(): RealTimeMatchmakingService {
    if (!RealTimeMatchmakingService.instance) {
      RealTimeMatchmakingService.instance = new RealTimeMatchmakingService();
    }
    return RealTimeMatchmakingService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      DebugLogger.log("Matchmaking service already initialized.");
      return;
    }

    try {
      DebugLogger.log("Initializing matchmaking service...");
      
      this.mainChannel = await this.channelManager.joinChannel('roast_battle_matchmaking');
      
      if (this.mainChannel) {
        DebugLogger.log("Successfully joined matchmaking channel.");
        this.setupPresenceListeners(this.mainChannel);
        this.isInitialized = true;
        
        // Start matchmaking and presence check intervals
        this.startIntervals();
      } else {
        DebugLogger.error("Failed to join matchmaking channel", "Channel creation failed");
      }
      
      // Check if user is already authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        this.currentUserId = sessionData.session.user.id;
        DebugLogger.log("User already authenticated:", this.currentUserId);
      }
    } catch (error) {
      DebugLogger.error("Error initializing matchmaking service", error);
    }
  }

  private setupPresenceListeners(channel: RealtimeChannel): void {
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        DebugLogger.log('Presence sync event received', state);
        
        // Process users from presence state
        const users = this.presenceHandler.getUsersFromPresence(state);
        DebugLogger.log(`Found ${users.length} users in presence state`);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        DebugLogger.log('Presence join event', { key, newPresences });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        DebugLogger.log('Presence leave event', { key, leftPresences });
        
        // If a user leaves, remove them from matchmaking
        if (leftPresences && leftPresences.length > 0) {
          const userId = leftPresences[0].user_id;
          if (userId) {
            this.presenceHandler.removeUser(userId);
            this.matchmakingQueue = this.matchmakingQueue.filter(id => id !== userId);
          }
        }
      });
  }
  
  private startIntervals(): void {
    // Run matchmaking algorithm every 2 seconds
    this.matchmakingInterval = window.setInterval(() => {
      this.processMatchmaking();
    }, 2000) as unknown as number;
    
    // Check presence every 5 seconds to ensure consistency
    this.presenceInterval = window.setInterval(() => {
      this.checkPresenceConsistency();
    }, 5000) as unknown as number;
  }
  
  private stopIntervals(): void {
    if (this.matchmakingInterval !== null) {
      clearInterval(this.matchmakingInterval);
      this.matchmakingInterval = null;
    }
    
    if (this.presenceInterval !== null) {
      clearInterval(this.presenceInterval);
      this.presenceInterval = null;
    }
  }
  
  private async processMatchmaking(): Promise<void> {
    // Skip if already processing or no users in queue
    if (this.presenceHandler.isMatchingInProgress() || this.matchmakingQueue.length === 0) {
      return;
    }
    
    this.presenceHandler.setMatchingInProgress(true);
    
    try {
      for (const userId of this.matchmakingQueue) {
        // Skip users that are no longer waiting
        const opponent = this.presenceHandler.getRandomWaitingUser(userId);
        
        if (opponent && this.matchmakingQueue.includes(opponent.id)) {
          // Create a match
          DebugLogger.log(`Creating match between ${userId} and ${opponent.id}`);
          
          // Remove both users from queue
          this.matchmakingQueue = this.matchmakingQueue.filter(
            id => id !== userId && id !== opponent.id
          );
          
          // Create a unique room ID
          const roomId = `battle_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
          this.battleRooms[userId] = roomId;
          this.battleRooms[opponent.id] = roomId;
          
          // Update status for both users
          this.presenceHandler.updateUserStatus(userId, 'matched', opponent.id);
          this.presenceHandler.updateUserStatus(opponent.id, 'matched', userId);
          
          // Notify both users
          this.notifyMatchFound(userId, opponent);
          this.notifyMatchFound(opponent.id, {
            id: userId,
            username: `User_${userId.substring(0, 4)}`,
            status: 'matched'
          });
        }
      }
      
      // Check for users that have been waiting too long and match with bots
      const now = Date.now();
      const BOT_MATCH_TIMEOUT = 8000; // 8 seconds
      
      for (const userId of this.matchmakingQueue) {
        const userJoinTime = this.botMatchService.getUserJoinTime(userId);
        
        if (userJoinTime && (now - userJoinTime > BOT_MATCH_TIMEOUT)) {
          DebugLogger.log(`User ${userId} has been waiting for ${now - userJoinTime}ms, matching with bot`);
          
          // Remove user from queue
          this.matchmakingQueue = this.matchmakingQueue.filter(id => id !== userId);
          
          // Create bot opponent and notify user
          const botOpponent = this.botMatchService.createBotOpponent();
          if (this.userListeners[userId]) {
            DebugLogger.log(`Notifying user ${userId} about bot match with ${botOpponent.id}`);
            this.userListeners[userId](botOpponent);
          }
        }
      }
      
    } catch (error) {
      DebugLogger.error("Error during matchmaking process", error);
    } finally {
      this.presenceHandler.setMatchingInProgress(false);
    }
  }
  
  private checkPresenceConsistency(): void {
    if (!this.mainChannel) return;
    
    const state = this.mainChannel.presenceState();
    const users = this.presenceHandler.getUsersFromPresence(state);
    
    // Log active users for debugging
    DebugLogger.log(`Presence check: ${users.length} users active, ${this.matchmakingQueue.length} in queue`);
  }

  public async enterMatchmaking(userId: string, username: string, avatarUrl?: string): Promise<void> {
    DebugLogger.log(`User ${userId} entering matchmaking queue.`);

    // Check if the user is already in the queue
    if (this.matchmakingQueue.includes(userId)) {
      DebugLogger.log(`User ${userId} is already in the matchmaking queue.`);
      return;
    }

    // Add user to queue
    this.matchmakingQueue.push(userId);
    
    // Track user join time for bot matching
    this.botMatchService.trackUserJoin(userId);
    
    // Track user presence
    if (this.mainChannel) {
      await this.presenceHandler.trackUserPresence(
        this.mainChannel,
        userId,
        username,
        avatarUrl
      );
    }
    
    DebugLogger.log(`User ${userId} added to matchmaking queue. Current queue: ${this.matchmakingQueue}`);
  }

  private notifyMatchFound(userId: string, opponent: User): void {
    if (this.userListeners[userId]) {
      this.userListeners[userId](opponent);
      DebugLogger.log(`Match notification sent to user ${userId} for opponent ${opponent.id}.`);
    } else {
      DebugLogger.warn(`No listener found for user ${userId}. Match notification skipped.`);
    }
  }

  public onMatchFound(userId: string, callback: (opponent: User | null) => void): void {
    this.userListeners[userId] = callback;
    DebugLogger.log(`Listener registered for user ${userId}.`);
  }

  public cancelMatchmaking(userId: string): void {
    DebugLogger.log(`Cancelling matchmaking for user ${userId}`);
    
    // Remove from queue
    this.matchmakingQueue = this.matchmakingQueue.filter(id => id !== userId);
    
    // Remove from battle rooms if present
    delete this.battleRooms[userId];
    
    // Remove listener
    delete this.userListeners[userId];
    
    // Remove from presence handler
    this.presenceHandler.removeUser(userId);
    
    // Clear any bot match timeouts
    this.botMatchService.clearBotMatchTimeout();
    this.botMatchService.removeUserJoin(userId);
  }
  
  public leaveBattle(userId: string): void {
    DebugLogger.log(`User ${userId} leaving battle`);
    const roomId = this.battleRooms[userId];
    if (roomId) {
      delete this.battleRooms[userId];
      // Find the opponent and notify them if possible
      const opponentId = Object.keys(this.battleRooms).find(key => this.battleRooms[key] === roomId && key !== userId);
      if (opponentId && this.userListeners[opponentId]) {
        // Notify opponent that user has left
        this.userListeners[opponentId](null);
        delete this.battleRooms[opponentId];
        delete this.userListeners[opponentId];
      }
    }
    delete this.userListeners[userId];
    this.presenceHandler.removeUser(userId);
  }

  public getCurrentUserId(): string {
    return this.currentUserId || '';
  }
  
  public async getCurrentUserSession() {
    const { data } = await supabase.auth.getSession();
    return data;
  }
  
  public cleanup(): void {
    this.stopIntervals();
    
    // Leave all channels
    if (this.mainChannel) {
      this.channelManager.leaveChannel(this.mainChannel);
      this.mainChannel = null;
    }
    
    // Clear all data
    this.matchmakingQueue = [];
    this.battleRooms = {};
    this.userListeners = {};
    this.isInitialized = false;
    
    DebugLogger.log("Matchmaking service cleaned up.");
  }
}

export default RealTimeMatchmakingService;
