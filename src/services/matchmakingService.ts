
import { toast } from "sonner";

// Types
export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  stream?: MediaStream;
}

type MatchmakingCallback = (opponent: User) => void;

class MatchmakingService {
  private static instance: MatchmakingService;
  private waitingUsers: Map<string, User> = new Map();
  private activeMatches: Map<string, string> = new Map(); // userId -> opponentId
  private callbacks: Map<string, MatchmakingCallback> = new Map();
  private userId: string | null = null;

  private constructor() {
    // Private constructor for singleton
    this.setupSimulatedServer();
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
    const userId = this.generateUserId();
    this.userId = userId;
    
    const user: User = {
      id: userId,
      username,
      avatarUrl
    };
    
    console.log("Initializing user for matchmaking:", user);
    return userId;
  }

  // Start looking for a match
  public findMatch(userId: string, callback: MatchmakingCallback): void {
    console.log(`User ${userId} is looking for a match`);
    
    // In a real implementation, this would connect to a server
    // For now, we'll simulate the process locally

    const user = {
      id: userId,
      username: localStorage.getItem('username') || `User_${userId.slice(0, 4)}`,
      avatarUrl: localStorage.getItem('avatarUrl') || undefined
    };
    
    // Add user to waiting pool
    this.waitingUsers.set(userId, user);
    this.callbacks.set(userId, callback);
    
    // Check for available matches
    this.checkForMatches(userId);
  }

  // Cancel matchmaking
  public cancelMatchmaking(userId: string): void {
    console.log(`User ${userId} cancelled matchmaking`);
    this.waitingUsers.delete(userId);
    this.callbacks.delete(userId);
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

  // Private methods
  private generateUserId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2, 10);
  }

  private checkForMatches(currentUserId: string): void {
    // In a real implementation, this would be handled by a backend service
    // For local simulation, we'll match with any other user in the waiting pool
    
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
        
        break;
      }
    }
  }

  // For testing/demo purposes: simulate a server with multiple connections
  private setupSimulatedServer(): void {
    // This simulates other users connecting to the service
    // In a real app, this would be replaced by actual server connections
    
    if (typeof window !== 'undefined') {
      // Listen for browser storage events to simulate multiple tabs/devices
      window.addEventListener('storage', (event) => {
        if (event.key === 'matchmaking_request' && this.userId) {
          try {
            const data = JSON.parse(event.newValue || '{}');
            if (data.userId !== this.userId) {
              console.log("Detected another user looking for match:", data.userId);
              
              // Add this user to our waiting pool
              const otherUser: User = {
                id: data.userId,
                username: data.username,
                avatarUrl: data.avatarUrl
              };
              
              this.waitingUsers.set(data.userId, otherUser);
              
              // Check for matches
              setTimeout(() => {
                this.checkForMatches(this.userId!);
              }, 1000);
            }
          } catch (e) {
            console.error("Error processing matchmaking event", e);
          }
        }
      });
    }
  }

  // Broadcast matchmaking request to other tabs/browsers
  public broadcastMatchmakingRequest(userId: string, username: string, avatarUrl?: string): void {
    if (typeof localStorage !== 'undefined') {
      const requestData = {
        userId,
        username,
        avatarUrl,
        timestamp: Date.now()
      };
      
      localStorage.setItem('matchmaking_request', JSON.stringify(requestData));
      // This triggers storage events in other tabs/browsers
    }
  }
}

export default MatchmakingService;
