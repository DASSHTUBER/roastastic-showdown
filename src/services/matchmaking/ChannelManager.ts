
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "./types";
import { DebugLogger } from "./DebugLogger";

export class ChannelManager {
  private channels: Map<string, any> = new Map();
  private connectionRetries: number = 0;
  private maxRetries: number = 3;
  private logger: DebugLogger;

  constructor(logger?: DebugLogger) {
    this.logger = logger || new DebugLogger("ChannelManager");
  }

  public joinChannel(
    channelName: string,
    onSync: (state: Record<string, any[]>) => void,
    onJoin: (presence: any) => void,
    onLeave: (presence: any) => void
  ): any {
    try {
      this.logger.log(`Joining channel: ${channelName}`);
      
      // Create the channel if it doesn't exist
      const channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: channelName,
          },
        },
      });

      // Setup presence handlers
      channel
        .on('presence', { event: 'sync' }, () => {
          this.logger.log('Presence sync event received');
          const state = channel.presenceState();
          this.logger.log('Current presence state:', state);
          
          // Update waitingUsers based on presence state
          onSync(state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string, newPresences: any[] }) => {
          if (newPresences && newPresences.length > 0) {
            onJoin(newPresences[0]);
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string, leftPresences: any[] }) => {
          if (leftPresences && leftPresences.length > 0) {
            onLeave(leftPresences[0]);
          }
        });

      // Store the channel
      this.channels.set(channelName, channel);
      
      return channel;
    } catch (error) {
      this.logger.error('Error joining channel:', error);
      throw error;
    }
  }

  public leaveChannel(channelName: string): void {
    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        this.logger.log(`Leaving channel: ${channelName}`);
        
        // Untrack presence and remove channel
        channel.untrack();
        supabase.removeChannel(channel);
        
        // Remove from our channels map
        this.channels.delete(channelName);
      }
    } catch (error) {
      this.logger.error('Error leaving channel:', error);
    }
  }

  public getChannelPresence(channelName: string): Record<string, any[]> | null {
    try {
      const channel = this.channels.get(channelName);
      if (channel) {
        return channel.presenceState();
      }
      return null;
    } catch (error) {
      this.logger.error('Error getting channel presence:', error);
      return null;
    }
  }
}
