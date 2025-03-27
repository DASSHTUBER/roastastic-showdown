
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

  private constructor() {
    this.botMatchService = new BotMatchService();
    this.storageEventService = new StorageEventService(this.waitingUsers, this.userId);
  }

  static getInstance(): MatchmakingService {
    if (!MatchmakingService.instance) {
      MatchmakingService.instance = new MatchmakingService();
    }
    return MatchmakingService.instance;
  }

  // Initialize user and prepare for matchmaking
  public initialize(username: string, avatarUrl?: string): string {
    // Generate a unique ID for this user
    const userId = generateUserId();
    this.userId = userId;
    
    const user: User = {
      id: userId,
      username,
      avatarUrl
    };
    
    console.log("Initializing user for matchmaking:", user);
    
    // Update the storageEventService with the new userId
    if (this.storageEventService) {
      this.storageEventService.cleanup();
    }
    this.storageEventService = new StorageEventService(this.waitingUsers, this.userId);
    
    return userId;
  }

  // Start looking for a match
  public findMatch(userId: string, callback: MatchmakingCallback, noUsersCallback?: NoUsersCallback): void {
    console.log(`User ${userId} is looking for a match`);
    
    // Reset bot match settings
    this.botMatchService.resetBotMatch();
    
    // Clean up any existing interval
    if (this.matchCheckInterval !== null) {
      clearInterval(this.matchCheckInterval);
    }
    
    const user = {
      id: userId,
      username: localStorage.getItem('username') || `User_${userId.slice(0, 4)}`,
      avatarUrl: localStorage.getItem('avatarUrl') || undefined
    };
    
    // Add user to waiting pool
    this.waitingUsers.set(userId, user);
    this.callbacks.set(userId, callback);
    
    if (noUsersCallback) {
      this.noUsersCallbacks.set(userId, noUsersCallback);
    }
    
    // Broadcast matchmaking request immediately and frequently
    this.lastBroadcastTime = broadcastMatchmakingRequest(userId, user.username, user.avatarUrl);
    
    // Check for matches immediately
    this.checkForMatches(userId);
    
    // Set up a regular interval to check for matches and broadcast presence
    this.matchCheckInterval = window.setInterval(() => {
      // Broadcast presence more frequently to ensure visibility
      const now = Date.now();
      if (now - this.lastBroadcastTime > 1000) { // Every second
        this.lastBroadcastTime = broadcastMatchmakingRequest(userId, user.username, user.avatarUrl);
      }
      
      // Check for matches more frequently
      this.checkForMatches(userId);
    }, 500); // Check every 500ms
    
    // Set timeout for bot match if no users found
    this.botMatchService.setBotMatchTimeout(() => {
      // If user is still in waiting pool after delay, check for other users
      if (this.waitingUsers.has(userId)) {
        // Check if there are no other users available
        const otherUsers = Array.from(this.waitingUsers.keys()).filter(id => id !== userId);
        if (otherUsers.length === 0) {
          // Notify user that no real opponents found
          const noUsersCallback = this.noUsersCallbacks.get(userId);
          if (noUsersCallback) {
            noUsersCallback();
          }
        }
      }
    });
  }

  // Cancel matchmaking
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
    
    // Broadcast cancellation to other users
    broadcastCancellation(userId);
  }

  // Clean up user when leaving or closing tab
  private cleanupUser(): void {
    if (this.userId) {
      this.cancelMatchmaking(this.userId);
      this.leaveBattle(this.userId);
    }
  }

  // Leave an active battle
  public leaveBattle(userId: string): void {
    const opponentId = this.activeMatches.get(userId);
    if (opponentId) {
      this.activeMatches.delete(userId);
      this.activeMatches.delete(opponentId);
      console.log(`User ${userId} left battle with ${opponentId}`);
    }
  }

  // Set user media stream (for video/audio)
  public setUserStream(userId: string, stream: MediaStream): void {
    const user = this.waitingUsers.get(userId);
    if (user) {
      user.stream = stream;
      this.waitingUsers.set(userId, user);
    }
  }

  // Get the current user's ID
  public getCurrentUserId(): string | null {
    return this.userId;
  }

  // Match with a bot if no real users available
  public matchWithBot(userId: string): void {
    if (!this.waitingUsers.has(userId)) return;
    
    const botOpponent = this.botMatchService.createBotOpponent();
    
    // Remove user from waiting pool
    const currentUser = this.waitingUsers.get(userId)!;
    this.waitingUsers.delete(userId);
    
    // Notify user of the bot match
    const currentUserCallback = this.callbacks.get(userId);
    if (currentUserCallback) {
      currentUserCallback(botOpponent);
    }
    
    // Clear any match check interval
    if (this.matchCheckInterval !== null) {
      clearInterval(this.matchCheckInterval);
      this.matchCheckInterval = null;
    }
    
    this.botMatchService.clearBotMatchTimeout();
  }

  // Check if bot matching is enabled
  public isBotMatchEnabled(): boolean {
    return this.botMatchService.isBotMatchEnabled();
  }

  private checkForMatches(currentUserId: string): void {
    // Only proceed if user is still in waiting pool
    if (!this.waitingUsers.has(currentUserId)) {
      return;
    }
    
    for (const [userId, user] of this.waitingUsers.entries()) {
      if (userId !== currentUserId) {
        // We found a match!
        console.log(`Found a match between ${currentUserId} and ${userId}`);
        
        // Remove both users from waiting pool
        const currentUser = this.waitingUsers.get(currentUserId)!;
        
        this.waitingUsers.delete(currentUserId);
        this.waitingUsers.delete(userId);
        
        // Add to active matches
        this.activeMatches.set(currentUserId, userId);
        this.activeMatches.set(userId, currentUserId);
        
        // Notify both users of the match
        const currentUserCallback = this.callbacks.get(currentUserId);
        const opponentCallback = this.callbacks.get(userId);
        
        if (currentUserCallback) {
          currentUserCallback(user);
        }
        
        if (opponentCallback) {
          opponentCallback(currentUser);
        }
        
        // Clear any match check interval
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
export { User };
