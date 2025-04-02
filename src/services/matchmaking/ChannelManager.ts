
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from './DebugLogger';

export class ChannelManager {
  private channels: Map<string, RealtimeChannel> = new Map();

  constructor() {
    // No need to store the logger instance as we're using static methods
  }

  public async joinChannel(channelName: string): Promise<RealtimeChannel | null> {
    try {
      DebugLogger.log(`Attempting to join channel: ${channelName}`);

      // Check if we already have this channel
      if (this.channels.has(channelName)) {
        const existingChannel = this.channels.get(channelName)!;
        if (existingChannel.state === 'joined') {
          DebugLogger.log(`Already joined channel: ${channelName}`);
          return existingChannel;
        } else {
          DebugLogger.log(`Cleaning up old channel: ${channelName}`);
          await this.leaveChannel(existingChannel);
        }
      }

      // Create a new channel with proper configuration
      const channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: channelName
          }
        }
      });

      // Set up channel listeners before subscribing
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          DebugLogger.log('Presence sync event received', state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          DebugLogger.log('Presence join event', { key, newPresences });
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          DebugLogger.log('Presence leave event', { key, leftPresences });
        });

      // Subscribe to the channel
      DebugLogger.log('Subscribing to channel...');
      
      try {
        await channel.subscribe((status) => {
          DebugLogger.log(`Channel status changed: ${status}`);
        });

        DebugLogger.log('Successfully subscribed to channel');
        this.channels.set(channelName, channel);
        return channel;
      } catch (subscribeError) {
        DebugLogger.error('Error subscribing to channel:', subscribeError);
        return null;
      }
    } catch (error) {
      DebugLogger.error(`Error joining channel: ${channelName}`, error as Error);
      return null;
    }
  }

  public async leaveChannel(channel: RealtimeChannel): Promise<void> {
    try {
      const channelId = channel.topic;
      DebugLogger.log(`Leaving channel: ${channelId}`);

      // Remove presence data
      try {
        await channel.untrack();
      } catch (untrackError) {
        DebugLogger.error('Error untracking presence:', untrackError);
      }

      // Unsubscribe from the channel
      try {
        await channel.unsubscribe();
      } catch (unsubError) {
        DebugLogger.error('Error unsubscribing from channel:', unsubError);
      }
      
      // Remove from our channels map
      this.channels.delete(channelId);
      
      DebugLogger.log(`Successfully left channel: ${channelId}`);
    } catch (error) {
      DebugLogger.error('Error leaving channel:', error as Error);
    }
  }

  public getChannelPresence(channel: RealtimeChannel): any {
    try {
      const state = channel.presenceState();
      DebugLogger.log('Current presence state:', state);
      return state;
    } catch (error) {
      DebugLogger.error('Error getting presence state:', error as Error);
      return {};
    }
  }
}
