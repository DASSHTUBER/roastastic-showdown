
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "./types";
import { DebugLogger } from "./DebugLogger";

export class ChannelManager {
  private channel: any = null;
  private channelName: string = 'public-matchmaking';
  private connectionRetries: number = 0;
  private maxRetries: number = 3;
  private logger: DebugLogger;

  constructor(logger: DebugLogger) {
    this.logger = logger;
  }

  public getChannel(): any {
    return this.channel;
  }

  public setupRealtimeChannel(
    userId: string, 
    user: User,
    onSync: (state: Record<string, any[]>) => void,
    onJoin: (key: string, newPresences: any[]) => void,
    onLeave: (key: string) => void,
    onMatchAccept: (payload: any) => void
  ): void {
    // First, clean up any existing channel
    this.cleanup();

    try {
      this.connectionRetries = 0;
      this.setupChannelWithRetry(userId, user, onSync, onJoin, onLeave, onMatchAccept);
    } catch (error) {
      console.error('Error setting up realtime channel:', error);
      toast.error("Failed to connect to matchmaking service");
    }
  }

  private setupChannelWithRetry(
    userId: string, 
    user: User,
    onSync: (state: Record<string, any[]>) => void,
    onJoin: (key: string, newPresences: any[]) => void,
    onLeave: (key: string) => void,
    onMatchAccept: (payload: any) => void
  ): void {
    if (this.connectionRetries >= this.maxRetries) {
      toast.error("Failed to connect to matchmaking service after multiple attempts");
      return;
    }

    this.connectionRetries++;

    // Use a consistent channel name for all matchmaking users
    this.logger.log(`Creating/joining channel: ${this.channelName} (Attempt ${this.connectionRetries})`);
    
    try {
      this.channel = supabase.channel(this.channelName, {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      // Setup presence handlers
      this.channel
        .on('presence', { event: 'sync' }, () => {
          this.logger.log('Presence sync event received');
          const state = this.channel.presenceState();
          this.logger.log('Current presence state:', state);
          
          // Update waitingUsers based on presence state
          onSync(state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string, newPresences: any[] }) => {
          onJoin(key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key }: { key: string }) => {
          onLeave(key);
        })
        .on('broadcast', { event: 'match_accept' }, (payload: any) => {
          onMatchAccept(payload);
        });

      // Subscribe to the channel with error handling
      this.channel.subscribe(async (status: string, err?: any) => {
        if (status === 'SUBSCRIBED') {
          // Track our presence once subscribed
          try {
            await this.channel.track({
              userId: userId,
              username: user.username,
              avatarUrl: user.avatarUrl,
              looking: true,
              joinedAt: new Date().toISOString()
            });
            this.logger.log('Successfully joined matchmaking channel');
            toast.success("Connected to matchmaking service");
          } catch (trackError) {
            console.error('Error tracking presence:', trackError);
            toast.error("Failed to register in matchmaking");
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.logger.log(`Channel error or timeout: ${status}`, err);
          // Retry connection
          setTimeout(() => this.setupChannelWithRetry(userId, user, onSync, onJoin, onLeave, onMatchAccept), 2000);
        } else {
          this.logger.log('Matchmaking channel subscription status:', status);
        }
      });
    } catch (error) {
      console.error('Error in setupChannelWithRetry:', error);
      // Retry after delay
      setTimeout(() => this.setupChannelWithRetry(userId, user, onSync, onJoin, onLeave, onMatchAccept), 2000);
    }
  }

  public cleanup(): void {
    // Clean up Supabase Realtime channel
    if (this.channel) {
      try {
        this.channel.untrack();
        supabase.removeChannel(this.channel);
        this.channel = null;
      } catch (error) {
        console.error('Error removing channel:', error);
      }
    }
  }
}
