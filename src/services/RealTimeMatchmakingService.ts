
import { supabase } from '@/integrations/supabase/client';
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
      
      const channel = await this.channelManager.joinChannel('roast_battle_matchmaking');
      
      if (channel) {
        DebugLogger.log("Successfully joined matchmaking channel.");
        this.isInitialized = true;
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

  public async enterMatchmaking(userId: string, username: string, avatarUrl?: string): Promise<void> {
    DebugLogger.log(`User ${userId} entering matchmaking queue.`);

    // Check if the user is already in the queue
    if (this.matchmakingQueue.includes(userId)) {
      DebugLogger.log(`User ${userId} is already in the matchmaking queue.`);
      return;
    }

    this.matchmakingQueue.push(userId);
    DebugLogger.log(`User ${userId} added to matchmaking queue. Current queue: ${this.matchmakingQueue}`);

    // Attempt to find a match immediately
    await this.attemptMatch(userId, username, avatarUrl);
    
    // If no match found and bot matches enabled, set timeout for bot match
    if (this.botMatchService.isBotMatchEnabled() && this.matchmakingQueue.length === 1) {
      DebugLogger.log("No suitable opponent found, setting up bot match timeout");
      this.botMatchService.setBotMatchTimeout(() => {
        // Only proceed if user is still in queue
        if (this.matchmakingQueue.includes(userId) && this.userListeners[userId]) {
          DebugLogger.log(`Matching user ${userId} with bot opponent`);
          const botOpponent = this.botMatchService.createBotOpponent();
          this.matchmakingQueue = this.matchmakingQueue.filter(id => id !== userId);
          this.userListeners[userId](botOpponent);
        }
      }, 8000); // 8 seconds timeout for bot match
    }
  }

  private async attemptMatch(userId: string, username: string, avatarUrl?: string): Promise<void> {
    if (this.matchmakingQueue.length < 2) {
      DebugLogger.log(`Not enough users in queue to form a match. Current queue length: ${this.matchmakingQueue.length}`);
      return;
    }

    const opponentId = this.matchmakingQueue.find(id => id !== userId);

    if (!opponentId) {
      DebugLogger.log(`No suitable opponent found for user ${userId} at this time.`);
      return;
    }

    // Remove both users from the queue before creating the battle room
    this.matchmakingQueue = this.matchmakingQueue.filter(id => id !== userId && id !== opponentId);

    // Create a unique room ID for the battle
    const roomId = `battle_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Assign both users to the same battle room
    this.battleRooms[userId] = roomId;
    this.battleRooms[opponentId] = roomId;

    DebugLogger.log(`Match found! User ${userId} and user ${opponentId} assigned to room ${roomId}.`);

    // Notify both users that a match has been found
    this.notifyMatchFound(userId, opponentId);
    this.notifyMatchFound(opponentId, userId);
  }

  private notifyMatchFound(userId: string, opponentId: string): void {
    if (this.userListeners[userId]) {
      // Create opponent object with minimal info
      const opponent: User = {
        id: opponentId,
        username: `User_${opponentId.substring(0, 4)}`,
        status: 'matched'
      };
      
      this.userListeners[userId](opponent);
      DebugLogger.log(`Match notification sent to user ${userId} for opponent ${opponentId}.`);
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
    this.matchmakingQueue = this.matchmakingQueue.filter(id => id !== userId);
    delete this.battleRooms[userId];
    delete this.userListeners[userId];
    
    // Clear any bot match timeouts
    this.botMatchService.clearBotMatchTimeout();
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
  }

  public getCurrentUserId(): string {
    return this.currentUserId || '';
  }
  
  public async getCurrentUserSession() {
    const { data } = await supabase.auth.getSession();
    return data;
  }
}

export default RealTimeMatchmakingService;
