
import { DebugLogger } from './DebugLogger';
import { User } from './types';

export class PresenceHandler {
  private logger: DebugLogger;

  constructor(logger: DebugLogger) {
    this.logger = logger;
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
      this.logger.error('Error getting users from presence', error as Error);
    }
    
    return users;
  }
}
