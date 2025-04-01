
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { DebugLogger } from './DebugLogger';

export class ChannelManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private logger: DebugLogger;

  constructor(logger: DebugLogger) {
    this.logger = logger;
  }

  public joinChannel(channelName: string, options?: any): RealtimeChannel {
    if (this.channels.has(channelName)) {
      this.logger.log(`Reusing existing channel: ${channelName}`);
      return this.channels.get(channelName)!;
    }

    this.logger.log(`Joining channel: ${channelName}`);
    const channel = supabase.channel(channelName, options);
    this.channels.set(channelName, channel);
    return channel;
  }

  public leaveChannel(channelId: string): void {
    if (this.channels.has(channelId)) {
      this.logger.log(`Leaving channel: ${channelId}`);
      const channel = this.channels.get(channelId)!;
      channel.unsubscribe();
      this.channels.delete(channelId);
    }
  }

  public getChannelPresence(channelId: string): any {
    if (!this.channels.has(channelId)) {
      this.logger.log(`Channel not found: ${channelId}`);
      return [];
    }
    
    const channel = this.channels.get(channelId)!;
    return channel.presenceState();
  }
}
