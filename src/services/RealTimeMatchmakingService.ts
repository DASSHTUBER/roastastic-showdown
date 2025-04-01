
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from './matchmaking/DebugLogger';
import { User } from './matchmaking/types';
import { ChannelManager } from './matchmaking/ChannelManager';
import { PresenceHandler } from './matchmaking/PresenceHandler';
import { StorageEventService } from './matchmaking/StorageEventService';
import { BotMatchService } from './matchmaking/BotMatchService';

export class RealTimeMatchmakingService {
  private channel: RealtimeChannel | null = null;
  private userStream: MediaStream | null = null;
  private userId: string = '';
  private username: string = '';
  private logger: DebugLogger;
  private channelManager: ChannelManager;
  private presenceHandler: PresenceHandler;
  private storageEventService: StorageEventService;
  private botMatchService: BotMatchService;
  private matchmakingCallbacks: ((opponent: User) => void)[] = [];
  private noUsersCallbacks: (() => void)[] = [];
  private currentOpponent: User | null = null;
  private isMatchmaking: boolean = false;
  private isBotMatchEnabled: boolean = true;

  constructor() {
    this.logger = new DebugLogger('Matchmaking', false);
    this.channelManager = new ChannelManager(this.logger);
    this.presenceHandler = new PresenceHandler(this.logger);
    this.storageEventService = new StorageEventService(this.logger);
    this.botMatchService = new BotMatchService();
  }

  public initialize(userId: string, username: string): void {
    this.userId = userId;
    this.username = username;
    this.logger.log(`Initialized with user ID: ${userId}, username: ${username}`);
  }

  public getCurrentUserId(): string {
    return this.userId;
  }

  public setUserStream(stream: MediaStream): void {
    this.userStream = stream;
    this.logger.log('User stream set');
  }

  public findMatch(callback: (opponent: User) => void, noUsersCallback?: () => void): void {
    if (!this.userId || !this.username) {
      this.logger.error('Cannot find match without user ID and username', new Error('Missing user information'));
      return;
    }

    if (this.isMatchmaking) {
      this.logger.log('Already matchmaking, canceling previous matchmaking');
      this.cancelMatchmaking();
    }

    this.isMatchmaking = true;
    this.matchmakingCallbacks.push(callback);
    if (noUsersCallback) {
      this.noUsersCallbacks.push(noUsersCallback);
    }

    this.connectToMatchmakingChannel();
  }

  private connectToMatchmakingChannel(): void {
    const channelName = 'matchmaking';
    
    this.channel = this.channelManager.joinChannel(channelName, {
      config: {
        presence: {
          key: this.userId,
        },
      },
    });

    this.channel.on('presence', { event: 'sync' }, () => {
      this.handlePresenceSync();
    });

    this.channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      this.logger.log('New presences joined', newPresences);
      this.checkForMatchmaking();
    });

    this.channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      this.logger.log('Presences left', leftPresences);
    });

    this.channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        this.channel?.track({
          user_id: this.userId,
          username: this.username,
          looking_for_match: true,
          joined_at: new Date().toISOString(),
        });
      }
    });
  }

  public cancelMatchmaking(): void {
    this.isMatchmaking = false;
    this.matchmakingCallbacks = [];
    this.noUsersCallbacks = [];
    
    if (this.channel) {
      this.channelManager.leaveChannel(this.channel.channelId);
      this.channel = null;
    }
    
    this.logger.log('Matchmaking canceled');
  }

  private handlePresenceSync(): void {
    this.checkForMatchmaking();
  }

  private checkForMatchmaking(): void {
    if (!this.isMatchmaking || !this.channel) {
      return;
    }

    const presences = this.channelManager.getChannelPresence(this.channel.channelId);
    this.logger.log('Current presences', presences);

    const users = this.presenceHandler.getUsersFromPresence(presences);
    const availableUsers = users.filter(user => user.id !== this.userId);

    if (availableUsers.length === 0) {
      this.handleNoUsersAvailable();
      return;
    }

    // Simple random matching for now
    const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
    this.matchWithUser(randomUser);
  }

  private matchWithUser(user: User): void {
    this.currentOpponent = user;
    this.isMatchmaking = false;
    
    this.storageEventService.createMatch(this.userId, user.id);
    
    this.executeMatchmakingCallbacks(user);
    
    this.cancelMatchmaking();
  }

  public matchWithBot(): void {
    const botUser = this.botMatchService.createBotUser();
    this.matchWithUser(botUser);
  }

  private handleNoUsersAvailable(): void {
    this.logger.log('No users available for matchmaking');
    
    if (this.isBotMatchEnabled) {
      setTimeout(() => {
        this.matchWithBot();
      }, 3000);
      return;
    }
    
    this.executeNoUsersCallbacks();
  }

  private executeMatchmakingCallbacks(opponent: User): void {
    this.matchmakingCallbacks.forEach(callback => {
      try {
        callback(opponent);
      } catch (error) {
        this.logger.error('Error executing matchmaking callback', error);
      }
    });
    this.matchmakingCallbacks = [];
  }

  private executeNoUsersCallbacks(): void {
    this.noUsersCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        this.logger.error('Error executing no users callback', error);
      }
    });
    this.noUsersCallbacks = [];
  }

  public leaveBattle(): void {
    // Implement leaving a battle
    this.currentOpponent = null;
    this.logger.log('Left battle');
  }
}

export const realTimeMatchmakingService = new RealTimeMatchmakingService();
