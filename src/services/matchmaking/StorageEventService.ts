
import { User } from './types';

export class StorageEventService {
  private waitingUsers: Map<string, User>;
  private currentUserId: string | null;

  constructor(waitingUsers: Map<string, User>, currentUserId: string | null) {
    this.waitingUsers = waitingUsers;
    this.currentUserId = currentUserId;
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
}
