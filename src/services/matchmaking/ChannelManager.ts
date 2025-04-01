import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from './DebugLogger';

export class ChannelManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private logger: DebugLogger;

  constructor(logger: DebugLogger) {
    this.logger = logger;
  }

  public async joinChannel(channelName: string, options?: any): Promise<RealtimeChannel | null> {
    if (this.channels.has(channelName)) {
      this.logger.log(`Reusing existing channel: ${channelName}`);
      return this.channels.get(channelName)!;
    }

    try {
      this.logger.log(`Joining channel: ${channelName}`);
      const channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: channelName,
          },
          broadcast: {
            self: true,
            ack: true
          }
        },
        events: {
          presence: {
            sync: true,
            join: true,
            leave: true
          }
        }
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          this.logger.log('Presence sync event received', state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          this.logger.log('Presence join event', { key, newPresences });
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          this.logger.log('Presence leave event', { key, leftPresences });
        })
        .on('broadcast', { event: 'presence' }, payload => {
          this.logger.log('Broadcast presence received', payload);
        });

      const status = await channel.subscribe((status, err) => {
        if (err) {
          this.logger.error('Channel subscription error:', err);
        } else {
          this.logger.log(`Channel status: ${status}`);
        }
      });

      if (status === 'SUBSCRIBED') {
        this.logger.log('Successfully subscribed to channel');
        this.channels.set(channelName, channel);
        return channel;
      } else {
        throw new Error(`Failed to subscribe to channel: ${status}`);
      }
    } catch (error) {
      this.logger.error(`Error joining channel: ${channelName}`, error as Error);
      return null;
    }
  }

  public async leaveChannel(channel: RealtimeChannel): Promise<void> {
    const channelId = channel.topic || '';
    if (this.channels.has(channelId)) {
      this.logger.log(`Leaving channel: ${channelId}`);
      try {
        await channel.untrack();
        await channel.unsubscribe();
        this.channels.delete(channelId);
        this.logger.log(`Successfully left channel: ${channelId}`);
      } catch (error) {
        this.logger.error(`Error leaving channel: ${channelId}`, error as Error);
      }
    }
  }

  public getChannelPresence(channel: RealtimeChannel): any {
    const channelId = channel.topic || '';
    if (!this.channels.has(channelId)) {
      this.logger.log(`Channel not found: ${channelId}`);
      return {};
    }
    
    try {
      const state = channel.presenceState();
      this.logger.log('Current presence state:', state);
      return state;
    } catch (error) {
      this.logger.error(`Error getting presence state for channel: ${channelId}`, error as Error);
      return {};
    }
  }
}
