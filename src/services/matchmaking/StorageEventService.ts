
import { DebugLogger } from './DebugLogger';

export class StorageEventService {
  private logger: DebugLogger;

  constructor(logger: DebugLogger) {
    this.logger = logger;
  }

  public createMatch(userId1: string, userId2: string): void {
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const matchData = {
      id: matchId,
      user1Id: userId1,
      user2Id: userId2,
      startTime: new Date().toISOString(),
      status: 'active'
    };

    // Store the match data in localStorage
    this.setMatchData(matchId, matchData);
    
    this.logger.log(`Created match: ${matchId} between users ${userId1} and ${userId2}`);
  }

  private setMatchData(matchId: string, data: any): void {
    try {
      localStorage.setItem(`match_${matchId}`, JSON.stringify(data));
    } catch (error) {
      this.logger.error('Error storing match data', error);
    }
  }
}
