import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from './DebugLogger';

export class ChannelManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private logger: DebugLogger;

  constructor(logger: DebugLogger) {
    this.logger = logger;
  }

  public async joinChannel(channelName: string): Promise<RealtimeChannel | null> {
    try {
      this.logger.log(`Attempting to join channel: ${channelName}`);

      // Check if we already have this channel
      if (this.channels.has(channelName)) {
        const existingChannel = this.channels.get(channelName)!;
        if (existingChannel.state === 'joined') {
          this.logger.log(`Already joined channel: ${channelName}`);
          return existingChannel;
        } else {
          this.logger.log(`Cleaning up old channel: ${channelName}`);
          await this.leaveChannel(existingChannel);
        }
      }

      // Create a new channel
      const channel = supabase.channel(channelName);

      // Set up channel listeners before subscribing
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
        });

      // Subscribe to the channel
      this.logger.log('Subscribing to channel...');
      const status = await channel.subscribe((status: string) => {
        this.logger.log(`Channel status changed: ${status}`);
      });

      if (status === 'SUBSCRIBED') {
        this.logger.log('Successfully subscribed to channel');
        this.channels.set(channelName, channel);
        return channel;
      } else {
        this.logger.error(`Failed to subscribe to channel. Status: ${status}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error joining channel: ${channelName}`, error as Error);
      return null;
    }
  }

  public async leaveChannel(channel: RealtimeChannel): Promise<void> {
    try {
      const channelId = channel.topic;
      this.logger.log(`Leaving channel: ${channelId}`);

      // Remove presence data
      if (channel.presence) {
        await channel.untrack();
      }

      // Unsubscribe from the channel
      await channel.unsubscribe();
      
      // Remove from our channels map
      this.channels.delete(channelId);
      
      this.logger.log(`Successfully left channel: ${channelId}`);
    } catch (error) {
      this.logger.error('Error leaving channel:', error as Error);
    }
  }

  public getChannelPresence(channel: RealtimeChannel): any {
    try {
      const state = channel.presenceState();
      this.logger.log('Current presence state:', state);
      return state;
    } catch (error) {
      this.logger.error('Error getting presence state:', error as Error);
      return {};
    }
  }
}
