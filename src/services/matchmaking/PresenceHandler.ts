
import { RealtimeChannel } from '@supabase/supabase-js';
import { DebugLogger } from './DebugLogger';
import { User, Presence } from './types';

export class PresenceHandler {
  private activeUsers: Map<string, User> = new Map();
  private lastPresenceUpdate: number = Date.now();
  private matchingInProgress: boolean = false;

  constructor() {
    // Initialize the presence handler
    this.lastPresenceUpdate = Date.now();
  }

  public getUsersFromPresence(presenceState: any): User[] {
    const users: User[] = [];
    
    try {
      if (!presenceState || typeof presenceState !== 'object') {
        return users;
      }
      
      Object.keys(presenceState).forEach(key => {
        if (Array.isArray(presenceState[key]) && presenceState[key].length > 0) {
          const presence = presenceState[key][0];
          users.push({
            id: presence.user_id || key,
            username: presence.username || 'Unknown User',
            avatarUrl: presence.avatar_url,
            status: presence.status || 'waiting'
          });
        }
      });
      
      this.lastPresenceUpdate = Date.now();
      DebugLogger.log(`Retrieved ${users.length} users from presence state`);
    } catch (error) {
      DebugLogger.error('Error getting users from presence', error as Error);
    }
    
    return users;
  }

  public async trackUserPresence(channel: RealtimeChannel, userId: string, username: string, avatarUrl?: string): Promise<boolean> {
    try {
      const userPresence: Presence = {
        user_id: userId,
        username: username,
        avatar_url: avatarUrl,
        status: 'waiting',
        joined_at: new Date().toISOString()
      };

      DebugLogger.log(`Tracking presence for user ${userId} (${username})`);
      
      const trackStatus = await channel.track(userPresence);
      
      if (trackStatus === 'ok') {
        this.activeUsers.set(userId, {
          id: userId,
          username: username,
          avatarUrl: avatarUrl,
          status: 'waiting'
        });
        return true;
      } else {
        DebugLogger.error(`Failed to track presence for user ${userId}`, { status: trackStatus });
        return false;
      }
    } catch (error) {
      DebugLogger.error(`Error tracking presence for user ${userId}`, error as Error);
      return false;
    }
  }

  public getRandomWaitingUser(currentUserId: string): User | null {
    const waitingUsers = Array.from(this.activeUsers.values())
      .filter(user => user.id !== currentUserId && user.status === 'waiting');
    
    if (waitingUsers.length === 0) {
      return null;
    }
    
    // Random selection for fair matching
    const randomIndex = Math.floor(Math.random() * waitingUsers.length);
    return waitingUsers[randomIndex];
  }
  
  public updateUserStatus(userId: string, status: 'waiting' | 'matched' | 'in_battle', opponentId?: string): void {
    const user = this.activeUsers.get(userId);
    if (user) {
      user.status = status;
      if (opponentId) {
        user.opponent_id = opponentId;
      }
      this.activeUsers.set(userId, user);
    }
  }
  
  public removeUser(userId: string): void {
    this.activeUsers.delete(userId);
  }
  
  public getActiveUsersCount(): number {
    return this.activeUsers.size;
  }
  
  public isMatchingInProgress(): boolean {
    return this.matchingInProgress;
  }
  
  public setMatchingInProgress(inProgress: boolean): void {
    this.matchingInProgress = inProgress;
  }
  
  public getLastPresenceUpdate(): number {
    return this.lastPresenceUpdate;
  }
}
