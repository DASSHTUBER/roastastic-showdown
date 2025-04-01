
import { User } from './types';

export class StorageEventService {
  private waitingUsers: Map<string, User>;
  private currentUserId: string | null;

  constructor(waitingUsers?: Map<string, User>, currentUserId?: string | null) {
    this.waitingUsers = waitingUsers || new Map();
    this.currentUserId = currentUserId || null;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageEvent);
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  public cleanup(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.handleStorageEvent);
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  private handleStorageEvent = (event: StorageEvent): void => {
    if (event.key === 'matchmaking_request' && this.currentUserId) {
      try {
        const data = JSON.parse(event.newValue || '{}');
        if (data.userId !== this.currentUserId) {
          console.log("Detected another user looking for match:", data.userId);
          
          // Add this user to our waiting pool if they're not already there
          const otherUser: User = {
            id: data.userId,
            username: data.username,
            avatarUrl: data.avatarUrl
          };
          
          this.waitingUsers.set(data.userId, otherUser);
        }
      } catch (e) {
        console.error("Error processing matchmaking event", e);
      }
    } else if (event.key === 'matchmaking_cancel' && this.currentUserId) {
      try {
        const data = JSON.parse(event.newValue || '{}');
        if (data.userId !== this.currentUserId) {
          console.log("User cancelled matchmaking:", data.userId);
          this.waitingUsers.delete(data.userId);
        }
      } catch (e) {
        console.error("Error processing matchmaking cancellation event", e);
      }
    }
  };

  private handleBeforeUnload = (): void => {
    // This is empty as the cleanup will be handled by the main service
  };

  // Add createMatch method
  public async createMatch(gameType: string, users: any[]): Promise<string> {
    try {
      // Generate a unique match ID
      const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // In a real implementation, this would save the match to a database
      // For now, we'll just return the match ID
      console.log(`Created match with ID ${matchId} for game type ${gameType} with users:`, users);
      
      // Store match info in localStorage for persistence
      localStorage.setItem(`match_${matchId}`, JSON.stringify({
        id: matchId,
        gameType,
        users,
        createdAt: new Date().toISOString()
      }));
      
      return matchId;
    } catch (error) {
      console.error("Error creating match:", error);
      throw new Error("Failed to create match");
    }
  }
}
