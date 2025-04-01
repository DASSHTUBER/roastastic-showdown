
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
      this.channel = await this.channelManager.joinChannel(supabase, this.channelName);
      
      if (!this.channel) {
        throw new Error('Failed to join channel');
      }
      
      // Track presence with user data
      await this.channel.track({
        user_id: userId,
        username: username,
        online_at: new Date().toISOString(),
      });
      
      this.debugLogger.log('Successfully joined matchmaking channel');
      
    } catch (error) {
      this.debugLogger.error('Error joining matchmaking', error as Error);
      throw error;
    }
  }

  // Leave the matchmaking channel
  public async leaveMatchmaking(): Promise<void> {
    if (!this.channel) {
      this.debugLogger.log('No active channel to leave');
      return;
    }
    
    try {
      await this.channelManager.leaveChannel(this.channel);
      this.channel = null;
      this.userId = null;
      this.username = null;
      this.user = null;
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
