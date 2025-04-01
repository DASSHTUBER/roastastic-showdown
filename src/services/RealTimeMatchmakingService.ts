
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ChannelManager } from './matchmaking/ChannelManager';
import { Presence } from './matchmaking/types';
import { DebugLogger } from './matchmaking/DebugLogger';
import { PresenceHandler } from './matchmaking/PresenceHandler';
import { StorageEventService } from './matchmaking/StorageEventService';

export type MatchmakingOptions = {
  gameType: string;
  skillLevel?: string;
  region?: string;
  isPrivate?: boolean;
  maxPlayers?: number;
  privateRoomCode?: string;
};

export type UserStatus = 'online' | 'away' | 'matchmaking' | 'in-game';

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  status?: UserStatus;
  skillLevel?: string;
  region?: string;
}

export type MatchmakingState = {
  status: 'idle' | 'searching' | 'matched' | 'error';
  error?: string;
  matchId?: string;
  opponents?: User[];
  options?: MatchmakingOptions;
};

export type UserJoinCallback = (user: User) => void;
export type UserLeaveCallback = (userId: string) => void;
export type MatchFoundCallback = (matchId: string, users: User[]) => void;
export type ErrorCallback = (error: Error) => void;

export class RealTimeMatchmakingService {
  private static instance: RealTimeMatchmakingService;
  private channel: RealtimeChannel | null = null;
  private user: User | null = null;
  private state: MatchmakingState = { status: 'idle' };
  private options: MatchmakingOptions | null = null;
  private channelManager: ChannelManager;
  private presenceHandler: PresenceHandler;
  private debug: DebugLogger;
  private storageEventService: StorageEventService;
  private isDebugMode: boolean = false;

  private onUserJoinCallback: UserJoinCallback | null = null;
  private onUserLeaveCallback: UserLeaveCallback | null = null;
  private onMatchFoundCallback: MatchFoundCallback | null = null;
  private onErrorCallback: ErrorCallback | null = null;

  private constructor() {
    this.debug = new DebugLogger('RealTimeMatchmakingService', false);
    this.channelManager = new ChannelManager(this.debug);
    this.presenceHandler = new PresenceHandler(this.debug);
    this.storageEventService = new StorageEventService();
    
    this.debug.log('Service initialized');
  }

  public static getInstance(): RealTimeMatchmakingService {
    if (!RealTimeMatchmakingService.instance) {
      RealTimeMatchmakingService.instance = new RealTimeMatchmakingService();
    }
    return RealTimeMatchmakingService.instance;
  }

  public setDebugMode(enabled: boolean): void {
    this.isDebugMode = enabled;
    this.debug.setDebugMode(enabled);
  }

  public setUser(user: User): void {
    this.user = user;
    this.debug.log('User set:', user);
  }

  public getState(): MatchmakingState {
    return this.state;
  }

  public onUserJoin(callback: UserJoinCallback): void {
    this.onUserJoinCallback = callback;
  }

  public onUserLeave(callback: UserLeaveCallback): void {
    this.onUserLeaveCallback = callback;
  }

  public onMatchFound(callback: MatchFoundCallback): void {
    this.onMatchFoundCallback = callback;
  }

  public onError(callback: ErrorCallback): void {
    this.onErrorCallback = callback;
  }

  public async startMatchmaking(options: MatchmakingOptions): Promise<void> {
    if (!this.user) {
      this.handleError(new Error('No user set'));
      return;
    }

    this.options = options;
    this.state = { status: 'searching', options };

    try {
      const channelName = this.getChannelName(options);
      this.debug.log('Starting matchmaking in channel:', channelName);

      this.channel = this.channelManager.joinChannel(
        channelName,
        this.handlePresenceSync.bind(this),
        this.handleUserJoin.bind(this),
        this.handleUserLeave.bind(this)
      );

      await this.channel.subscribe();
      
      await this.channel.track({
        user_id: this.user.id,
        username: this.user.username,
        avatar_url: this.user.avatarUrl,
        status: 'matchmaking',
        skill_level: this.user.skillLevel || options.skillLevel,
        region: this.user.region || options.region,
        joined_at: new Date().toISOString(),
      });

      this.debug.log('Joined channel and tracking presence');
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  public async stopMatchmaking(): Promise<void> {
    if (!this.channel || !this.user) {
      this.debug.log('No channel or user to stop matchmaking for.');
      return;
    }

    try {
      this.debug.log('Stopping matchmaking');
      await this.channel.untrack();
      this.debug.log('Untracked presence');
      await this.channel.unsubscribe();
      this.debug.log('Unsubscribed from channel');
      this.channelManager.leaveChannel(this.channel.topic);
      this.debug.log('Left channel');
    } catch (error) {
      this.handleError(error as Error);
    } finally {
      this.channel = null;
      this.options = null;
      this.state = { status: 'idle' };
      this.debug.log('Matchmaking stopped and state reset');
    }
  }

  private getChannelName(options: MatchmakingOptions): string {
    let channelName = `matchmaking:${options.gameType}`;
    
    if (options.skillLevel) {
      channelName += `:${options.skillLevel}`;
    }
    if (options.region) {
      channelName += `:${options.region}`;
    }
    if (options.isPrivate && options.privateRoomCode) {
      channelName += `:private-${options.privateRoomCode}`;
    }

    return channelName;
  }

  private async handlePresenceSync(): Promise<void> {
    if (!this.channel) return;

    const presence = this.channelManager.getChannelPresence(this.channel.topic);
    this.debug.log('Handling presence sync:', presence);

    if (!presence) return;

    const users = this.presenceHandler.getUsersFromPresence(presence);
    this.debug.log('Users in channel:', users);

    if (this.options?.maxPlayers && users.length >= this.options?.maxPlayers && this.user) {
      this.debug.log('Max players reached, attempting to create match');
      
      const userDetails = users.map(user => ({
        user_id: user.user_id,
        username: user.username,
        avatar_url: user.avatar_url,
        status: user.status,
        skill_level: user.skill_level,
        region: user.region
      }));

      try {
        const matchId = await this.storageEventService.createMatch(
          this.options.gameType,
          userDetails
        );

        this.state = { status: 'matched', matchId, opponents: users as unknown as User[] };
        this.debug.log('Match created with ID:', matchId, 'State:', this.state);
        
        if (this.onMatchFoundCallback) {
          const usersForCallback: User[] = users.map(p => ({
            id: p.user_id,
            username: p.username,
            avatarUrl: p.avatar_url,
            status: p.status as UserStatus,
            skillLevel: p.skill_level,
            region: p.region
          }));
          this.onMatchFoundCallback(matchId, usersForCallback);
        }
      } catch (storageError) {
        this.handleError(storageError as Error);
      }
    }
  }

  private handleUserLeave(presence: Presence): void {
    if (!this.user || !this.onUserLeaveCallback) return;
    this.onUserLeaveCallback(presence.user_id);
  }

  private handleError(error: Error): void {
    console.error('Matchmaking Error:', error);
    this.state = { status: 'error', error: error.message };
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  private handleUserJoin(presence: Presence): void {
    if (!this.user || !this.onUserJoinCallback) return;
    
    const user: User = {
      id: presence.user_id,
      username: presence.username,
      avatarUrl: presence.avatar_url,
      status: presence.status as UserStatus,
      skillLevel: presence.skill_level,
      region: presence.region
    };
    
    this.onUserJoinCallback(user);
  }
}
