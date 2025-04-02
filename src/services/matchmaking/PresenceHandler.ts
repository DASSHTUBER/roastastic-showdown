
import { DebugLogger } from './DebugLogger';
import { User } from './types';

export class PresenceHandler {
  constructor() {
    // No need to store the logger instance as we're using static methods
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
          });
        }
      });
    } catch (error) {
      DebugLogger.error('Error getting users from presence', error as Error);
    }
    
    return users;
  }
}
