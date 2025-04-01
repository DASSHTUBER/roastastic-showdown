import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ChannelManager } from './matchmaking/ChannelManager';
import { User } from './matchmaking/types';
import { PresenceHandler } from './matchmaking/PresenceHandler';
import { StorageEventService } from './matchmaking/StorageEventService';
import { DebugLogger } from './matchmaking/DebugLogger';
import { BotMatchService } from './matchmaking/BotMatchService';

// Singleton instance
let instance: RealTimeMatchmakingService | null = null;

export class RealTimeMatchmakingService {
  private debugLogger: DebugLogger;
  private channelManager: ChannelManager;
  private presenceHandler: PresenceHandler;
  private storageService: StorageEventService;
  private botMatchService: BotMatchService;
  private channel: RealtimeChannel | null = null;
  private channelName: string = 'matchmaking';
  private user: User | null = null;
  private userId: string | null = null;
  private username: string | null = null;
  private _isBotMatchEnabled: boolean = false;
  private matchmakingTimeout: NodeJS.Timeout | null = null;
  private isLookingForMatch: boolean = false;
  
  // Private constructor for Singleton pattern
  private constructor() {
    this.debugLogger = new DebugLogger(true);
    this.channelManager = new ChannelManager(this.debugLogger);
    this.presenceHandler = new PresenceHandler(this.debugLogger);
    this.storageService = new StorageEventService(this.debugLogger);
    this.botMatchService = new BotMatchService();
  }
  
  // Get singleton instance
  public static getInstance(): RealTimeMatchmakingService {
    if (!instance) {
      instance = new RealTimeMatchmakingService();
    }
    return instance;
  }

  // Initialize the service
  public initialize(): void {
    this.debugLogger.log('Initializing RealTimeMatchmakingService');
  }

  // Join the matchmaking channel
  public async joinMatchmaking(userId: string, username: string): Promise<void> {
    this.userId = userId;
    this.username = username;
    this.user = { id: userId, username };
    
    this.debugLogger.log('Joining matchmaking', { userId, username });
    
    try {
      // Create or join the channel
      this.channel = await this.channelManager.joinChannel(this.channelName);
      
      if (!this.channel) {
        throw new Error('Failed to join channel');
      }
      
      // Track presence with user data
      await this.channel.track({
        user_id: userId,
        username: username,
        online_at: new Date().toISOString(),
        status: 'waiting'
      });

      // Subscribe to presence changes
      this.channel.on('presence', { event: 'sync' }, () => {
        this.handlePresenceSync();
      });

      this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        this.handlePresenceJoin(newPresences);
      });

      this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        this.handlePresenceLeave(leftPresences);
      });
      
      this.debugLogger.log('Successfully joined matchmaking channel');
      
    } catch (error) {
      this.debugLogger.error('Error joining matchmaking', error as Error);
      throw error;
    }
  }

  private handlePresenceSync() {
    if (!this.channel) return;
    
    const presenceState = this.channelManager.getChannelPresence(this.channel);
    const onlineUsers = this.presenceHandler.getUsersFromPresence(presenceState);
    
    if (this.isLookingForMatch) {
      this.findMatch(onlineUsers);
    }
  }

  private handlePresenceJoin(newPresences: any[]) {
    if (!this.isLookingForMatch) return;
    
    const onlineUsers = this.presenceHandler.getUsersFromPresence(
      this.channelManager.getChannelPresence(this.channel!)
    );
    
    this.findMatch(onlineUsers);
  }

  private handlePresenceLeave(leftPresences: any[]) {
    // Handle user leaving if needed
  }

  private async findMatch(onlineUsers: User[]) {
    if (!this.user || !this.userId) return;

    // Filter out current user and find available opponents
    const availableOpponents = onlineUsers.filter(
      user => user.id !== this.userId && user.status === 'waiting'
    );

    if (availableOpponents.length > 0) {
      // Select the first available opponent
      const opponent = availableOpponents[0];
      
      // Update status to matched
      await this.channel?.track({
        ...this.user,
        status: 'matched',
        opponent_id: opponent.id
      });

      // Create the match
      const matchId = await this.createMatch(opponent.id);
      this.debugLogger.log('Match created', { matchId, opponent });
      
      // Stop looking for matches
      this.isLookingForMatch = false;
      if (this.matchmakingTimeout) {
        clearTimeout(this.matchmakingTimeout);
        this.matchmakingTimeout = null;
      }
    }
  }

  // Start looking for a match
  public async startMatchmaking(): Promise<void> {
    if (!this.channel || !this.user) {
      throw new Error('Not connected to matchmaking channel');
    }

    this.isLookingForMatch = true;
    
    // Update status to waiting
    await this.channel.track({
      ...this.user,
      status: 'waiting'
    });

    // Set a timeout for bot match if enabled
    if (this._isBotMatchEnabled) {
      this.matchmakingTimeout = setTimeout(async () => {
        if (this.isLookingForMatch) {
          this.debugLogger.log('No human opponent found, creating bot match');
          await this.createBotMatch();
        }
      }, 30000); // 30 seconds timeout
    }
  }

  // Leave the matchmaking channel
  public async leaveMatchmaking(): Promise<void> {
    if (!this.channel) {
      this.debugLogger.log('No active channel to leave');
      return;
    }
    
    try {
      if (this.matchmakingTimeout) {
        clearTimeout(this.matchmakingTimeout);
        this.matchmakingTimeout = null;
      }
      
      await this.channelManager.leaveChannel(this.channel);
      this.channel = null;
      this.userId = null;
      this.username = null;
      this.user = null;
      this.isLookingForMatch = false;
      this.debugLogger.log('Left matchmaking channel');
    } catch (error) {
      this.debugLogger.error('Error leaving matchmaking', error as Error);
    }
  }

  // Get all users in the matchmaking system
  public async getOnlineUsers(): Promise<User[]> {
    if (!this.channel) {
      this.debugLogger.log('Not connected to matchmaking channel');
      return [];
    }
    
    try {
      const presenceState = await this.channelManager.getChannelPresence(this.channel);
      
      if (!presenceState) {
        return [];
      }
      
      return this.presenceHandler.getUsersFromPresence(presenceState);
    } catch (error) {
      this.debugLogger.error('Error getting online users', error as Error);
      return [];
    }
  }

  // Create a match with another user
  public async createMatch(opponentId: string): Promise<string> {
    if (!this.user || !this.userId) {
      throw new Error('User not initialized');
    }
    
    try {
      return await this.storageService.createMatch(this.userId, opponentId);
    } catch (error) {
      this.debugLogger.error('Error creating match', error as Error);
      throw error;
    }
  }

  // Enable or disable bot matches
  public enableBotMatch(enable: boolean): void {
    this._isBotMatchEnabled = enable;
    this.debugLogger.log(`Bot matching ${enable ? 'enabled' : 'disabled'}`);
  }
  
  // Check if bot matching is enabled
  public isBotMatchEnabled(): boolean {
    return this._isBotMatchEnabled;
  }
  
  // Get the current user ID
  public getCurrentUserId(): string | null {
    return this.userId;
  }
  
  // Leave the current battle
  public async leaveBattle(userId: string): Promise<void> {
    if (!this.channel) {
      this.debugLogger.log('No active channel to leave');
      return;
    }
    
    try {
      await this.leaveMatchmaking();
      this.debugLogger.log(`User ${userId} left the battle`);
    } catch (error) {
      this.debugLogger.error('Error leaving battle', error as Error);
      throw error;
    }
  }
  
  // Create a match with a bot
  public async createBotMatch(): Promise<string> {
    if (!this.user || !this.userId) {
      throw new Error('User not initialized');
    }
    
    try {
      const botUser = this.botMatchService.createBotUser();
      return await this.createMatch(botUser.id);
    } catch (error) {
      this.debugLogger.error('Error creating bot match', error as Error);
      throw error;
    }
  }
}
