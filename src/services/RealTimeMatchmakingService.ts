import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from './matchmaking/DebugLogger';

export class RealTimeMatchmakingService {
  private static instance: RealTimeMatchmakingService;
  private isInitialized: boolean = false;
  private matchmakingQueue: string[] = [];
  private battleRooms: { [userId: string]: string } = {};
  private userListeners: { [userId: string]: (opponentId: string | null) => void } = {};

  // Singleton pattern
  public static getInstance(): RealTimeMatchmakingService {
    if (!RealTimeMatchmakingService.instance) {
      RealTimeMatchmakingService.instance = new RealTimeMatchmakingService();
    }
    return RealTimeMatchmakingService.instance;
  }

  public initialize(debug: boolean = false): void {
    if (this.isInitialized) {
      DebugLogger.log("Matchmaking service already initialized.");
      return;
    }

    const debugMode = debug ? 'true' : 'false';

    supabase
      .channel('roast_battle_matchmaking')
      .on('presence', { event: 'sync' }, () => {
        const presenceState = supabase.channel('roast_battle_matchmaking').presenceState();
        DebugLogger.log("Presence sync:", presenceState);
      })
      .on('presence', { event: 'join' }, (payload) => {
        DebugLogger.log("User joined:", payload);
      })
      .on('presence', { event: 'leave' }, (payload) => {
        DebugLogger.log("User left:", payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          DebugLogger.log("Successfully subscribed to the matchmaking channel.");
          await supabase.presence.track({ status: 'online' });
          this.isInitialized = true;
        } else {
          DebugLogger.error(`Subscription error: ${status}`);
        }
      });
  }

  public async enterMatchmaking(userId: string, username: string, avatarUrl?: string): Promise<void> {
    DebugLogger.log(`User ${userId} entering matchmaking queue.`);

    // Check if the user is already in the queue
    if (this.matchmakingQueue.includes(userId)) {
      DebugLogger.log(`User ${userId} is already in the matchmaking queue.`);
      return;
    }

    this.matchmakingQueue.push(userId);
    DebugLogger.log(`User ${userId} added to matchmaking queue. Current queue: ${this.matchmakingQueue}`);

    // Attempt to find a match immediately
    await this.attemptMatch(userId, username, avatarUrl);
  }

  private async attemptMatch(userId: string, username: string, avatarUrl?: string): Promise<void> {
    if (this.matchmakingQueue.length < 2) {
      DebugLogger.log(`Not enough users in queue to form a match. Current queue length: ${this.matchmakingQueue.length}`);
      return;
    }

    const opponentId = this.matchmakingQueue.find(id => id !== userId);

    if (!opponentId) {
      DebugLogger.log(`No suitable opponent found for user ${userId} at this time.`);
      return;
    }

    // Remove both users from the queue before creating the battle room
    this.matchmakingQueue = this.matchmakingQueue.filter(id => id !== userId && id !== opponentId);

    // Create a unique room ID for the battle
    const roomId = `battle_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Assign both users to the same battle room
    this.battleRooms[userId] = roomId;
    this.battleRooms[opponentId] = roomId;

    DebugLogger.log(`Match found! User ${userId} and user ${opponentId} assigned to room ${roomId}.`);

    // Notify both users that a match has been found
    this.notifyMatchFound(userId, opponentId, username, avatarUrl);
    this.notifyMatchFound(opponentId, userId, username, avatarUrl);
  }

  private notifyMatchFound(userId: string, opponentId: string, username: string, avatarUrl?: string): void {
    if (this.userListeners[userId]) {
      this.userListeners[userId](opponentId);
      DebugLogger.log(`Match notification sent to user ${userId} for opponent ${opponentId}.`);
    } else {
      DebugLogger.warn(`No listener found for user ${userId}. Match notification skipped.`);
    }
  }

  public onMatchFound(userId: string, callback: (opponentId: string | null) => void): void {
    this.userListeners[userId] = callback;
    DebugLogger.log(`Listener registered for user ${userId}.`);
  }

  public cancelMatchmaking(userId: string): void {
    DebugLogger.log(`Cancelling matchmaking for user ${userId}`);
    this.matchmakingQueue = this.matchmakingQueue.filter(id => id !== userId);
    delete this.battleRooms[userId];
    delete this.userListeners[userId];
  }

  public someMethodThatShouldReturnString(): string {
    return 'success';
  }
  
  public leaveBattle(userId: string): void {
    DebugLogger.log(`User ${userId} leaving battle`);
    const roomId = this.battleRooms[userId];
    if (roomId) {
      delete this.battleRooms[userId];
      // Find the opponent and remove them as well
      const opponentId = Object.keys(this.battleRooms).find(key => this.battleRooms[key] === roomId && key !== userId);
      if (opponentId) {
        delete this.battleRooms[opponentId];
        delete this.userListeners[opponentId];
      }
    }
    delete this.userListeners[userId];
  }

  public getCurrentUserId(): string {
    const { data } = supabase.auth.getSession();
    return data?.session?.user?.id || '';
  }
}

export default RealTimeMatchmakingService;
