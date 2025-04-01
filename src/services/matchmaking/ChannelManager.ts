
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from './DebugLogger';

export class ChannelManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private logger: DebugLogger;

  constructor(logger: DebugLogger) {
    this.logger = logger;
  }

  public joinChannel(channelName: string, options?: any): RealtimeChannel | null {
    if (this.channels.has(channelName)) {
      this.logger.log(`Reusing existing channel: ${channelName}`);
      return this.channels.get(channelName)!;
    }

    try {
      this.logger.log(`Joining channel: ${channelName}`);
      const channel = supabase.channel(channelName, options);
      this.channels.set(channelName, channel);
      return channel;
    } catch (error) {
      this.logger.error(`Error joining channel: ${channelName}`, error as Error);
      return null;
    }
  }

  public leaveChannel(channel: RealtimeChannel): void {
    const channelId = channel.topic || '';
    if (this.channels.has(channelId)) {
      this.logger.log(`Leaving channel: ${channelId}`);
      channel.unsubscribe();
      this.channels.delete(channelId);
    }
  }

  public getChannelPresence(channel: RealtimeChannel): any {
    const channelId = channel.topic || '';
    if (!this.channels.has(channelId)) {
      this.logger.log(`Channel not found: ${channelId}`);
      return {};
    }
    
    try {
      return channel.presenceState();
    } catch (error) {
      this.logger.error(`Error getting presence state for channel: ${channelId}`, error as Error);
      return {};
    }
  }
}
