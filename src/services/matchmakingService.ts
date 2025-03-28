
import { toast } from "sonner";
import { User, MatchmakingCallback, NoUsersCallback } from "./matchmaking/types";
import { generateUserId, broadcastMatchmakingRequest, broadcastCancellation } from "./matchmaking/utils";
import { BotMatchService } from "./matchmaking/BotMatchService";
import { StorageEventService } from "./matchmaking/StorageEventService";

class MatchmakingService {
  private static instance: MatchmakingService;
  private waitingUsers: Map<string, User> = new Map();
  private activeMatches: Map<string, string> = new Map(); // userId -> opponentId
  private callbacks: Map<string, MatchmakingCallback> = new Map();
  private noUsersCallbacks: Map<string, NoUsersCallback> = new Map();
  private userId: string | null = null;
  private matchCheckInterval: number | null = null;
  private lastBroadcastTime: number = 0;
  private botMatchService: BotMatchService;
  private storageEventService: StorageEventService | null = null;
  private broadcastChannel: BroadcastChannel | null = null;

  private constructor() {
    this.botMatchService = new BotMatchService();
    this.storageEventService = new StorageEventService(this.waitingUsers, this.userId);
    
    // Initialize BroadcastChannel for cross-device communication if available
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('matchmaking_channel');
        this.setupBroadcastListeners();
      } catch (error) {
        console.error('BroadcastChannel not supported:', error);
      }
    }
    
    // Add window unload listener to clean up resources
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this.cleanupUser.bind(this));
    }
  }

  static getInstance(): MatchmakingService {
    if (!MatchmakingService.instance) {
      MatchmakingService.instance = new MatchmakingService();
    }
    return MatchmakingService.instance;
  }

  private setupBroadcastListeners(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = (event) => {
        const { type, data } = event.data;
        
        switch (type) {
          case 'matchmaking_request':
            if (data.userId !== this.userId) {
              console.log("Received matchmaking request from another device:", data.userId);
              this.waitingUsers.set(data.userId, {
                id: data.userId,
                username: data.username,
                avatarUrl: data.avatarUrl
              });
            }
            break;
            
          case 'matchmaking_cancel':
            if (data.userId !== this.userId) {
              console.log("User cancelled matchmaking (broadcast):", data.userId);
              this.waitingUsers.delete(data.userId);
            }
            break;
            
          case 'match_accept':
            if (data.opponentId === this.userId) {
              console.log("Match accepted by:", data.userId);
              // Handle match acceptance
            }
            break;
        }
      };
    }
  }

  private broadcast(type: string, data: any): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type, data });
    }
  }

  public initialize(username: string, avatarUrl?: string): string {
    const userId = generateUserId();
    this.userId = userId;
    
    const user: User = {
      id: userId,
      username,
      avatarUrl
    };
    
    console.log("Initializing user for matchmaking:", user);
    
    if (this.storageEventService) {
      this.storageEventService.cleanup();
    }
    this.storageEventService = new StorageEventService(this.waitingUsers, this.userId);
    
    return userId;
  }

  public findMatch(userId: string, callback: MatchmakingCallback, noUsersCallback?: NoUsersCallback): void {
    console.log(`User ${userId} is looking for a match`);
    
    this.botMatchService.resetBotMatch();
    
    if (this.matchCheckInterval !== null) {
      clearInterval(this.matchCheckInterval);
    }
    
    const user = {
      id: userId,
      username: localStorage.getItem('username') || `User_${userId.slice(0, 4)}`,
      avatarUrl: localStorage.getItem('avatarUrl') || undefined
    };
    
    this.waitingUsers.set(userId, user);
    this.callbacks.set(userId, callback);
    
    if (noUsersCallback) {
      this.noUsersCallbacks.set(userId, noUsersCallback);
    }
    
    // Broadcast matchmaking request through localStorage for same-origin tabs
    this.lastBroadcastTime = broadcastMatchmakingRequest(userId, user.username, user.avatarUrl);
    
    // Broadcast through BroadcastChannel for cross-domain/device communication
    this.broadcast('matchmaking_request', {
      userId,
      username: user.username,
      avatarUrl: user.avatarUrl,
      timestamp: Date.now()
    });
    
    this.checkForMatches(userId);
    
    this.matchCheckInterval = window.setInterval(() => {
      const now = Date.now();
      if (now - this.lastBroadcastTime > 1000) {
        // Broadcast through localStorage
        this.lastBroadcastTime = broadcastMatchmakingRequest(userId, user.username, user.avatarUrl);
        
        // Broadcast through BroadcastChannel
        this.broadcast('matchmaking_request', {
          userId,
          username: user.username,
          avatarUrl: user.avatarUrl,
          timestamp: Date.now()
        });
      }
      
      this.checkForMatches(userId);
    }, 500);
    
    this.botMatchService.setBotMatchTimeout(() => {
      if (this.waitingUsers.has(userId)) {
        const otherUsers = Array.from(this.waitingUsers.keys()).filter(id => id !== userId);
        if (otherUsers.length === 0) {
          const noUsersCallback = this.noUsersCallbacks.get(userId);
          if (noUsersCallback) {
            noUsersCallback();
          }
        }
      }
    });
  }

  public cancelMatchmaking(userId: string): void {
    console.log(`User ${userId} cancelled matchmaking`);
    this.waitingUsers.delete(userId);
    this.callbacks.delete(userId);
    this.noUsersCallbacks.delete(userId);
    
    if (this.matchCheckInterval !== null) {
      clearInterval(this.matchCheckInterval);
      this.matchCheckInterval = null;
    }
    
    this.botMatchService.clearBotMatchTimeout();
    
    // Broadcast through localStorage
    broadcastCancellation(userId);
    
    // Broadcast through BroadcastChannel
    this.broadcast('matchmaking_cancel', {
      userId,
      timestamp: Date.now()
    });
  }

  private cleanupUser(): void {
    if (this.userId) {
      this.cancelMatchmaking(this.userId);
      this.leaveBattle(this.userId);
      
      if (this.broadcastChannel) {
        this.broadcastChannel.close();
      }
    }
  }

  public leaveBattle(userId: string): void {
    const opponentId = this.activeMatches.get(userId);
    if (opponentId) {
      this.activeMatches.delete(userId);
      this.activeMatches.delete(opponentId);
      console.log(`User ${userId} left battle with ${opponentId}`);
    }
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
    
    if (this.matchCheckInterval !== null) {
      clearInterval(this.matchCheckInterval);
      this.matchCheckInterval = null;
    }
    
    this.botMatchService.clearBotMatchTimeout();
  }

  public isBotMatchEnabled(): boolean {
    return this.botMatchService.isBotMatchEnabled();
  }

  private checkForMatches(currentUserId: string): void {
    if (!this.waitingUsers.has(currentUserId)) {
      return;
    }
    
    for (const [userId, user] of this.waitingUsers.entries()) {
      if (userId !== currentUserId) {
        console.log(`Found a match between ${currentUserId} and ${userId}`);
        
        const currentUser = this.waitingUsers.get(currentUserId)!;
        
        this.waitingUsers.delete(currentUserId);
        this.waitingUsers.delete(userId);
        
        this.activeMatches.set(currentUserId, userId);
        this.activeMatches.set(userId, currentUserId);
        
        const currentUserCallback = this.callbacks.get(currentUserId);
        const opponentCallback = this.callbacks.get(userId);
        
        // Broadcast match accept
        this.broadcast('match_accept', {
          userId: currentUserId,
          opponentId: userId,
          timestamp: Date.now()
        });
        
        if (currentUserCallback) {
          currentUserCallback(user);
        }
        
        if (opponentCallback) {
          opponentCallback(currentUser);
        }
        
        if (this.matchCheckInterval !== null) {
          clearInterval(this.matchCheckInterval);
          this.matchCheckInterval = null;
        }
        
        this.botMatchService.clearBotMatchTimeout();
        
        break;
      }
    }
  }
}

export default MatchmakingService;
export type { User };

