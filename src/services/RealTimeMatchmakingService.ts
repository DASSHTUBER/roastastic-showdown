
import { supabase } from "@/integrations/supabase/client";
import { User, MatchmakingCallback, NoUsersCallback } from "./matchmaking/types";
import { generateUserId } from "./matchmaking/utils";
import { BotMatchService } from "./matchmaking/BotMatchService";
import { toast } from "sonner";

class RealTimeMatchmakingService {
  private static instance: RealTimeMatchmakingService;
  private waitingUsers: Map<string, User> = new Map();
  private activeMatches: Map<string, string> = new Map(); // userId -> opponentId
  private callbacks: Map<string, MatchmakingCallback> = new Map();
  private noUsersCallbacks: Map<string, NoUsersCallback> = new Map();
  private userId: string | null = null;
  private username: string = "";
  private avatarUrl?: string;
  private botMatchService: BotMatchService;
  private channel: any = null;
  private checkInterval: number | null = null;
  private channelName: string = 'public-matchmaking';
  private lastPresenceUpdate: number = 0;

  private constructor() {
    this.botMatchService = new BotMatchService();
  }

  static getInstance(): RealTimeMatchmakingService {
    if (!RealTimeMatchmakingService.instance) {
      RealTimeMatchmakingService.instance = new RealTimeMatchmakingService();
    }
    return RealTimeMatchmakingService.instance;
  }

  public initialize(username: string, avatarUrl?: string): string {
    const userId = generateUserId();
    this.userId = userId;
    this.username = username;
    this.avatarUrl = avatarUrl;
    
    console.log("Initializing user for matchmaking:", { userId, username, avatarUrl });
    
    return userId;
  }

  public findMatch(userId: string, callback: MatchmakingCallback, noUsersCallback?: NoUsersCallback): void {
    console.log(`User ${userId} is looking for a match`);
    
    this.botMatchService.resetBotMatch();
    
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
    }
    
    const user: User = {
      id: userId,
      username: this.username || localStorage.getItem('username') || `User_${userId.slice(0, 4)}`,
      avatarUrl: this.avatarUrl || localStorage.getItem('avatarUrl') || undefined
    };
    
    this.waitingUsers.set(userId, user);
    this.callbacks.set(userId, callback);
    
    if (noUsersCallback) {
      this.noUsersCallbacks.set(userId, noUsersCallback);
    }
    
    // Set up Supabase Realtime channel for matchmaking
    this.setupRealtimeChannel(userId, user);
    
    // Set an interval to check for matchmaking timeouts and refresh presence
    this.checkInterval = window.setInterval(() => {
      this.refreshPresence(userId, user);
      this.checkForMatches(userId);
    }, 5000);
    
    // Set bot match timeout
    this.botMatchService.setBotMatchTimeout(() => {
      if (this.waitingUsers.has(userId)) {
        const otherUsers = Array.from(this.waitingUsers.keys()).filter(id => id !== userId);
        console.log("Current waiting users:", otherUsers);
        if (otherUsers.length === 0) {
          const noUsersCallback = this.noUsersCallbacks.get(userId);
          if (noUsersCallback) {
            console.log("No other users found, triggering noUsersCallback");
            noUsersCallback();
          }
        }
      }
    });
  }

  private setupRealtimeChannel(userId: string, user: User): void {
    // First, clean up any existing channel
    if (this.channel) {
      try {
        this.channel.untrack();
        supabase.removeChannel(this.channel);
      } catch (error) {
        console.error('Error removing existing channel:', error);
      }
    }

    try {
      // Use a consistent channel name for all matchmaking users
      console.log(`Creating/joining channel: ${this.channelName}`);
      
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
          console.log('Presence sync event received');
          const state = this.channel.presenceState();
          console.log('Current presence state:', state);
          
          // Update waitingUsers based on presence state
          this.updateWaitingUsers(state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string, newPresences: any[] }) => {
          console.log('User joined:', key, newPresences);
          
          if (key !== userId) {
            // Add this user to our waiting pool if they're not already there
            const otherUser = newPresences[0];
            if (otherUser && !this.waitingUsers.has(key)) {
              const user: User = {
                id: key,
                username: otherUser.username || `User_${key.slice(0, 4)}`,
                avatarUrl: otherUser.avatarUrl
              };
              this.waitingUsers.set(key, user);
              console.log(`Added user ${key} to waiting pool, current pool:`, Array.from(this.waitingUsers.keys()));
            }
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string, leftPresences: any[] }) => {
          console.log('User left:', key, leftPresences);
          
          if (key !== userId) {
            // Remove this user from our waiting pool
            this.waitingUsers.delete(key);
            console.log(`Removed user ${key} from waiting pool, current pool:`, Array.from(this.waitingUsers.keys()));
          }
        })
        .on('broadcast', { event: 'match_accept' }, (payload) => {
          console.log('Match accept broadcast received:', payload);
          const { senderId, targetId } = payload;
          
          if (targetId === userId) {
            // Someone wants to match with us
            const sender = this.waitingUsers.get(senderId);
            if (sender) {
              this.acceptMatch(userId, senderId);
            }
          }
        });

      // Subscribe to the channel with error handling
      this.channel.subscribe(async (status: string, err?: any) => {
        if (err) {
          console.error('Channel subscription error:', err);
          toast.error("Failed to connect to matchmaking service");
          return;
        }
        
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
            console.log('Successfully joined matchmaking channel');
            toast.success("Connected to matchmaking service");
            this.lastPresenceUpdate = Date.now();
          } catch (trackError) {
            console.error('Error tracking presence:', trackError);
            toast.error("Failed to register in matchmaking");
          }
        } else {
          console.log('Matchmaking channel subscription status:', status);
        }
      });
    } catch (error) {
      console.error('Error setting up realtime channel:', error);
      toast.error("Failed to connect to matchmaking service");
    }
  }

  private refreshPresence(userId: string, user: User): void {
    if (!this.channel) return;
    
    // Only refresh presence if more than 10 seconds have passed since last update
    const now = Date.now();
    if (now - this.lastPresenceUpdate > 10000) {
      try {
        this.channel.track({
          userId: userId,
          username: user.username,
          avatarUrl: user.avatarUrl,
          looking: true,
          joinedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        this.lastPresenceUpdate = now;
        console.log('Refreshed presence in matchmaking channel');
      } catch (error) {
        console.error('Error refreshing presence:', error);
      }
    }
  }

  private updateWaitingUsers(state: Record<string, any[]>): void {
    // Log the raw presence state for debugging
    console.log('Raw presence state:', JSON.stringify(state));
    
    // Reset waiting users based on current presence state
    const previousUsers = new Map(this.waitingUsers);
    
    // We only want to clear other users, not ourselves
    if (this.userId) {
      const currentUser = this.waitingUsers.get(this.userId);
      this.waitingUsers.clear();
      if (currentUser) {
        this.waitingUsers.set(this.userId, currentUser);
      }
    } else {
      this.waitingUsers.clear();
    }
    
    // Add all users from presence state
    Object.entries(state).forEach(([userId, presences]) => {
      // Skip ourselves
      if (userId === this.userId) return;
      
      const userPresence = presences[0];
      if (userPresence && userPresence.looking) {
        const user: User = {
          id: userId,
          username: userPresence.username || `User_${userId.slice(0, 4)}`,
          avatarUrl: userPresence.avatarUrl
        };
        this.waitingUsers.set(userId, user);
        console.log(`Added user ${userId} from presence state`);
      }
    });
    
    console.log("Updated waiting users:", Array.from(this.waitingUsers.keys()));
  }

  public cancelMatchmaking(userId: string): void {
    console.log(`User ${userId} cancelled matchmaking`);
    this.waitingUsers.delete(userId);
    this.callbacks.delete(userId);
    this.noUsersCallbacks.delete(userId);
    
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.botMatchService.clearBotMatchTimeout();
    
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

  public leaveBattle(userId: string): void {
    const opponentId = this.activeMatches.get(userId);
    if (opponentId) {
      this.activeMatches.delete(userId);
      this.activeMatches.delete(opponentId);
      console.log(`User ${userId} left battle with ${opponentId}`);
    }
    
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

  public setUserStream(userId: string, stream: MediaStream): void {
    const user = this.waitingUsers.get(userId);
    if (user) {
      user.stream = stream;
      this.waitingUsers.set(userId, user);
    }
  }

  public getCurrentUserId(): string | null {
    return this.userId;
  }

  public matchWithBot(userId: string): void {
    if (!this.waitingUsers.has(userId)) return;
    
    const botOpponent = this.botMatchService.createBotOpponent();
    
    const currentUser = this.waitingUsers.get(userId)!;
    this.waitingUsers.delete(userId);
    
    const currentUserCallback = this.callbacks.get(userId);
    if (currentUserCallback) {
      currentUserCallback(botOpponent);
    }
    
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.botMatchService.clearBotMatchTimeout();
    
    // Clean up Supabase Realtime channel
    if (this.channel) {
      try {
        this.channel.untrack();
        supabase.removeChannel(this.channel);
      } catch (error) {
        console.error('Error removing channel:', error);
      }
      this.channel = null;
    }
  }

  public isBotMatchEnabled(): boolean {
    return this.botMatchService.isBotMatchEnabled();
  }

  private checkForMatches(currentUserId: string): void {
    if (!this.waitingUsers.has(currentUserId)) {
      console.log(`User ${currentUserId} is no longer waiting for a match`);
      return;
    }
    
    const otherUsers = Array.from(this.waitingUsers.entries())
      .filter(([userId]) => userId !== currentUserId);
    
    console.log(`Checking for matches for user ${currentUserId}, available users:`, 
      otherUsers.map(([id, user]) => `${id} (${user.username})`));
    
    if (otherUsers.length === 0) {
      console.log(`No other users available for user ${currentUserId}`);
      return;
    }

    // Find the first available user
    const [opponentId, opponent] = otherUsers[0];
    console.log(`Found a potential match between ${currentUserId} and ${opponentId}`);
    
    // Initiate match with this user
    if (this.channel) {
      try {
        this.channel.send({
          type: 'broadcast',
          event: 'match_accept',
          payload: {
            senderId: currentUserId,
            targetId: opponentId
          }
        });
        console.log(`Match request sent to ${opponentId}`);
      } catch (error) {
        console.error('Error sending match request:', error);
      }
    }
  }

  private acceptMatch(currentUserId: string, opponentId: string): void {
    if (!this.waitingUsers.has(currentUserId) || !this.waitingUsers.has(opponentId)) {
      console.log(`Accept match failed: one of the users not available`, 
        {currentUserAvailable: this.waitingUsers.has(currentUserId), 
         opponentAvailable: this.waitingUsers.has(opponentId)});
      return;
    }
    
    console.log(`Accepting match between ${currentUserId} and ${opponentId}`);
    
    const currentUser = this.waitingUsers.get(currentUserId)!;
    const opponent = this.waitingUsers.get(opponentId)!;
    
    this.waitingUsers.delete(currentUserId);
    this.waitingUsers.delete(opponentId);
    
    this.activeMatches.set(currentUserId, opponentId);
    this.activeMatches.set(opponentId, currentUserId);
    
    const currentUserCallback = this.callbacks.get(currentUserId);
    
    if (currentUserCallback) {
      currentUserCallback(opponent);
      toast.success(`Match found with ${opponent.username}!`);
    }
    
    if (this.checkInterval !== null) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    this.botMatchService.clearBotMatchTimeout();
  }
}

export default RealTimeMatchmakingService;
