
import { supabase } from "@/integrations/supabase/client";
import { User, MatchmakingCallback, NoUsersCallback } from "./matchmaking/types";
import { generateUserId } from "./matchmaking/utils";
import { BotMatchService } from "./matchmaking/BotMatchService";
import { toast } from "sonner";
import { ChannelManager } from "./matchmaking/ChannelManager";
import { PresenceHandler } from "./matchmaking/PresenceHandler";
import { DebugLogger } from "./matchmaking/DebugLogger";

class RealTimeMatchmakingService {
  private static instance: RealTimeMatchmakingService;
  private waitingUsers: Map<string, User> = new Map();
  private activeMatches: Map<string, string> = new Map(); // userId -> opponentId
  private callbacks: Map<string, MatchmakingCallback> = new Map();
  private noUsersCallbacks: Map<string, NoUsersCallback> = new Map();
  private userId: string | null = null;
  private username: string = "";
  private avatarUrl?: string;
  private botMatchService: BotMatchService;
  private checkInterval: number | null = null;
  private channelManager: ChannelManager;
  private presenceHandler: PresenceHandler;
  private logger: DebugLogger;

  private constructor() {
    this.botMatchService = new BotMatchService();
    this.logger = new DebugLogger(true);
    this.channelManager = new ChannelManager(this.logger);
    this.presenceHandler = new PresenceHandler(this.logger);
    this.logger.log('Matchmaking service initialized');
  }

  static getInstance(): RealTimeMatchmakingService {
    if (!RealTimeMatchmakingService.instance) {
      RealTimeMatchmakingService.instance = new RealTimeMatchmakingService();
    }
    return RealTimeMatchmakingService.instance;
  }

  public setDebugMode(enabled: boolean): void {
    this.logger.setDebugMode(enabled);
  }

  public initialize(username: string, avatarUrl?: string): string {
    const userId = generateUserId();
    this.userId = userId;
    this.username = username;
    this.avatarUrl = avatarUrl;
    
    this.logger.log("Initializing user for matchmaking:", { userId, username, avatarUrl });
    
    return userId;
  }

  public findMatch(userId: string, callback: MatchmakingCallback, noUsersCallback?: NoUsersCallback): void {
    this.logger.log(`User ${userId} is looking for a match`);
    
    this.botMatchService.resetBotMatch();
    
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
    }
    
    const user: User = {
      id: userId,
      username: this.username || localStorage.getItem('username') || `User_${userId.slice(0, 4)}`,
      avatarUrl: this.avatarUrl || localStorage.getItem('avatarUrl') || undefined
    };
    
    this.waitingUsers.set(userId, user);
    this.callbacks.set(userId, callback);
    
    if (noUsersCallback) {
      this.noUsersCallbacks.set(userId, noUsersCallback);
    }
    
    // Set up Supabase Realtime channel for matchmaking
    this.channelManager.setupRealtimeChannel(
      userId, 
      user, 
      (state) => this.updateWaitingUsers(state),
      (key, newPresences) => this.handleUserJoin(key, newPresences, userId),
      (key) => this.handleUserLeave(key),
      (payload) => this.handleMatchAccept(payload, userId)
    );
    
    // Set an interval to check for matchmaking timeouts and refresh presence
    this.checkInterval = window.setInterval(() => {
      this.presenceHandler.refreshPresence(
        this.channelManager.getChannel(),
        userId,
        user
      );
      this.checkForMatches(userId);
      
      // Log current waiting users for debugging
      this.logger.log("Current waiting users:", Array.from(this.waitingUsers.keys()));
    }, 3000); // Check more frequently
    
    // Set bot match timeout
    this.botMatchService.setBotMatchTimeout(() => {
      if (this.waitingUsers.has(userId)) {
        const otherUsers = Array.from(this.waitingUsers.keys()).filter(id => id !== userId);
        this.logger.log("Current waiting users when checking for bot match:", otherUsers);
        if (otherUsers.length === 0) {
          const noUsersCallback = this.noUsersCallbacks.get(userId);
          if (noUsersCallback) {
            this.logger.log("No other users found, triggering noUsersCallback");
            noUsersCallback();
          }
        }
      }
    });
  }

  private handleUserJoin(key: string, newPresences: any[], currentUserId: string): void {
    this.logger.log('User joined:', key, newPresences);
    
    if (key !== currentUserId) {
      // Add this user to our waiting pool if they're not already there
      const otherUser = newPresences[0];
      if (otherUser && !this.waitingUsers.has(key)) {
        const user: User = {
          id: key,
          username: otherUser.username || `User_${key.slice(0, 4)}`,
          avatarUrl: otherUser.avatarUrl
        };
        this.waitingUsers.set(key, user);
        this.logger.log(`Added user ${key} to waiting pool, current pool:`, Array.from(this.waitingUsers.keys()));
        
        // Check for matches immediately when a new user joins
        if (this.userId) {
          this.checkForMatches(this.userId);
        }
      }
    }
  }

  private handleUserLeave(key: string): void {
    this.logger.log('User left:', key);
    
    if (key !== this.userId) {
      // Remove this user from our waiting pool
      this.waitingUsers.delete(key);
      this.logger.log(`Removed user ${key} from waiting pool, current pool:`, Array.from(this.waitingUsers.keys()));
    }
  }

  private handleMatchAccept(payload: any, currentUserId: string): void {
    this.logger.log('Match accept broadcast received:', payload);
    const { senderId, targetId } = payload;
    
    if (targetId === currentUserId) {
      // Someone wants to match with us
      const sender = this.waitingUsers.get(senderId);
      if (sender) {
        this.acceptMatch(currentUserId, senderId);
      }
    }
  }

  private updateWaitingUsers(state: Record<string, any[]>): void {
    // Log the raw presence state for debugging
    this.logger.log('Raw presence state:', JSON.stringify(state));
    
    // Reset waiting users based on current presence state
    const previousUsers = new Map(this.waitingUsers);
    
    // We only want to clear other users, not ourselves
    if (this.userId) {
      const currentUser = this.waitingUsers.get(this.userId);
      this.waitingUsers.clear();
      if (currentUser) {
        this.waitingUsers.set(this.userId, currentUser);
      }
    } else {
      this.waitingUsers.clear();
    }
    
    // Add all users from presence state
    Object.entries(state).forEach(([userId, presences]) => {
      // Skip ourselves
      if (userId === this.userId) return;
      
      const userPresence = presences[0];
      if (userPresence && userPresence.looking) {
        const user: User = {
          id: userId,
          username: userPresence.username || `User_${userId.slice(0, 4)}`,
          avatarUrl: userPresence.avatarUrl
        };
        this.waitingUsers.set(userId, user);
        this.logger.log(`Added user ${userId} from presence state`);
      }
    });
    
    this.logger.log("Updated waiting users:", Array.from(this.waitingUsers.keys()));
    
    // Check for matches immediately after presence sync
    if (this.userId) {
      this.checkForMatches(this.userId);
    }
  }

  public cancelMatchmaking(userId: string): void {
    this.logger.log(`User ${userId} cancelled matchmaking`);
    this.waitingUsers.delete(userId);
    this.callbacks.delete(userId);
    this.noUsersCallbacks.delete(userId);
    
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.botMatchService.clearBotMatchTimeout();
    
    // Clean up Supabase Realtime channel
    this.channelManager.cleanup();
  }

  public leaveBattle(userId: string): void {
    const opponentId = this.activeMatches.get(userId);
    if (opponentId) {
      this.activeMatches.delete(userId);
      this.activeMatches.delete(opponentId);
      this.logger.log(`User ${userId} left battle with ${opponentId}`);
    }
    
    // Clean up Supabase Realtime channel
    this.channelManager.cleanup();
  }

  public setUserStream(userId: string, stream: MediaStream): void {
    const user = this.waitingUsers.get(userId);
    if (user) {
      user.stream = stream;
      this.waitingUsers.set(userId, user);
    }
  }

  public getCurrentUserId(): string | null {
    return this.userId;
  }

  public matchWithBot(userId: string): void {
    if (!this.waitingUsers.has(userId)) return;
    
    const botOpponent = this.botMatchService.createBotOpponent();
    
    const currentUser = this.waitingUsers.get(userId)!;
    this.waitingUsers.delete(userId);
    
    const currentUserCallback = this.callbacks.get(userId);
    if (currentUserCallback) {
      currentUserCallback(botOpponent);
    }
    
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.botMatchService.clearBotMatchTimeout();
    
    // Clean up Supabase Realtime channel
    this.channelManager.cleanup();
  }

  public isBotMatchEnabled(): boolean {
    return this.botMatchService.isBotMatchEnabled();
  }

  private checkForMatches(currentUserId: string): void {
    if (!this.waitingUsers.has(currentUserId)) {
      this.logger.log(`User ${currentUserId} is no longer waiting for a match`);
      return;
    }
    
    const otherUsers = Array.from(this.waitingUsers.entries())
      .filter(([userId]) => userId !== currentUserId);
    
    this.logger.log(`Checking for matches for user ${currentUserId}, available users:`, 
      otherUsers.map(([id, user]) => `${id} (${user.username})`));
    
    if (otherUsers.length === 0) {
      this.logger.log(`No other users available for user ${currentUserId}`);
      return;
    }

    // Find the first available user
    const [opponentId, opponent] = otherUsers[0];
    this.logger.log(`Found a potential match between ${currentUserId} and ${opponentId}`);
    
    // Initiate match with this user
    const channel = this.channelManager.getChannel();
    if (channel) {
      try {
        channel.send({
          type: 'broadcast',
          event: 'match_accept',
          payload: {
            senderId: currentUserId,
            targetId: opponentId
          }
        });
        this.logger.log(`Match request sent to ${opponentId}`);
        
        // Auto-accept after a short delay
        // This helps when there are network issues or sync issues
        setTimeout(() => {
          if (this.waitingUsers.has(currentUserId) && this.waitingUsers.has(opponentId)) {
            this.acceptMatch(currentUserId, opponentId);
          }
        }, 2000);
      } catch (error) {
        console.error('Error sending match request:', error);
      }
    }
  }

  private acceptMatch(currentUserId: string, opponentId: string): void {
    if (!this.waitingUsers.has(currentUserId) || !this.waitingUsers.has(opponentId)) {
      this.logger.log(`Accept match failed: one of the users not available`, 
        {currentUserAvailable: this.waitingUsers.has(currentUserId), 
         opponentAvailable: this.waitingUsers.has(opponentId)});
      return;
    }
    
    this.logger.log(`Accepting match between ${currentUserId} and ${opponentId}`);
    
    const currentUser = this.waitingUsers.get(currentUserId)!;
    const opponent = this.waitingUsers.get(opponentId)!;
    
    this.waitingUsers.delete(currentUserId);
    this.waitingUsers.delete(opponentId);
    
    this.activeMatches.set(currentUserId, opponentId);
    this.activeMatches.set(opponentId, currentUserId);
    
    const currentUserCallback = this.callbacks.get(currentUserId);
    
    if (currentUserCallback) {
      currentUserCallback(opponent);
      toast.success(`Match found with ${opponent.username}!`);
    }
    
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.botMatchService.clearBotMatchTimeout();
  }
}

export default RealTimeMatchmakingService;
