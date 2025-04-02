
import { DebugLogger } from './DebugLogger';

export class StorageEventService {
  private waitingUsers?: Map<string, any>;
  private userId?: string | null;

  constructor(waitingUsers?: Map<string, any>, userId?: string | null) {
    this.waitingUsers = waitingUsers;
    this.userId = userId;
  }

  public cleanup(): void {
    // Clean up any listeners or resources
    DebugLogger.log('StorageEventService cleaned up');
  }

  public createMatch(userId: string, opponentId: string): void {
    try {
      // Store match information in localStorage for persistence
      const matchData = {
        userId,
        opponentId,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`match_${userId}_${opponentId}`, JSON.stringify(matchData));
      DebugLogger.log(`Match created between ${userId} and ${opponentId}`);
    } catch (error) {
      DebugLogger.error('Error creating match', error as Error);
    }
  }
}
