
import { Presence } from "./types";
import { DebugLogger } from "./DebugLogger";

export class PresenceHandler {
  private lastPresenceUpdate: number = 0;
  private logger: DebugLogger;

  constructor(logger?: DebugLogger) {
    this.logger = logger || new DebugLogger("PresenceHandler");
  }

  public refreshPresence(channel: any, userId: string, user: any): void {
    if (!channel) return;
    
    // Only refresh presence if more than 5 seconds have passed since last update
    const now = Date.now();
    if (now - this.lastPresenceUpdate > 5000) {
      try {
        channel.track({
          userId: userId,
          username: user.username,
          avatarUrl: user.avatarUrl,
          looking: true,
          joinedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        this.lastPresenceUpdate = now;
        this.logger.log('Refreshed presence in matchmaking channel');
      } catch (error) {
        console.error('Error refreshing presence:', error);
      }
    }
  }

  public getUsersFromPresence(presence: Record<string, any[]>): Presence[] {
    try {
      // Extract users from presence state
      const users: Presence[] = [];
      
      for (const key in presence) {
        if (presence[key] && presence[key].length > 0) {
          // Get the most recent presence data for this user
          const userData = presence[key][0];
          users.push(userData);
        }
      }
      
      return users;
    } catch (error) {
      console.error('Error extracting users from presence:', error);
      return [];
    }
  }
}
