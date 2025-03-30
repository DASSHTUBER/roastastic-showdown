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
  private debugMode: boolean = true; // Enable debug mode by default
  private connectionRetries: number = 0;
  private maxRetries: number = 3;

  private constructor() {
    this.botMatchService = new BotMatchService();
    this.logDebug('Matchmaking service initialized');
  }

  static getInstance(): RealTimeMatchmakingService {
    if (!RealTimeMatchmakingService.instance) {
      RealTimeMatchmakingService.instance = new RealTimeMatchmakingService();
    }
    return RealTimeMatchmakingService.instance;
  }

  private logDebug(message: string, data?: any): void {
    if (this.debugMode) {
      if (data) {
        console.log(`[Matchmaking] ${message}`, data);
      } else {
        console.log(`[Matchmaking] ${message}`);
      }
    }
  }

  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  public initialize(username: string, avatarUrl?: string): string {
    const userId = generateUserId();
    this.userId = userId;
    this.username = username;
    this.avatarUrl = avatarUrl;
    
    this.logDebug("Initializing user for matchmaking:", { userId, username, avatarUrl });
    
    return userId;
  }

  public findMatch(userId: string, callback: MatchmakingCallback, noUsersCallback?: NoUsersCallback): void {
    this.logDebug(`User ${userId} is looking for a match`);
    
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
      
      // Log current waiting users for debugging
      this.logDebug("Current waiting users:", Array.from(this.waitingUsers.keys()));
    }, 3000); // Check more frequently
    
    // Set bot match timeout
    this.botMatchService.setBotMatchTimeout(() => {
      if (this.waitingUsers.has(userId)) {
        const otherUsers = Array.from(this.waitingUsers.keys()).filter(id => id !== userId);
        this.logDebug("Current waiting users when checking for bot match:", otherUsers);
        if (otherUsers.length === 0) {
          const noUsersCallback = this.noUsersCallbacks.get(userId);
          if (noUsersCallback) {
            this.logDebug("No other users found, triggering noUsersCallback");
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
      this.connectionRetries = 0;
      this.setupChannelWithRetry(userId, user);
    } catch (error) {
      console.error('Error setting up realtime channel:', error);
      toast.error("Failed to connect to matchmaking service");
    }
  }

  private setupChannelWithRetry(userId: string, user: User): void {
    if (this.connectionRetries >= this.maxRetries) {
      toast.error("Failed to connect to matchmaking service after multiple attempts");
      return;
    }

    this.connectionRetries++;

    // Use a consistent channel name for all matchmaking users
    this.logDebug(`Creating/joining channel: ${this.channelName} (Attempt ${this.connectionRetries})`);
    
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
          this.logDebug('Presence sync event received');
          const state = this.channel.presenceState();
          this.logDebug('Current presence state:', state);
          
          // Update waitingUsers based on presence state
          this.updateWaitingUsers(state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }: { key: string, newPresences: any[] }) => {
          this.logDebug('User joined:', key, newPresences);
          
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
              this.logDebug(`Added user ${key} to waiting pool, current pool:`, Array.from(this.waitingUsers.keys()));
              
              // Check for matches immediately when a new user joins
              if (this.userId) {
                this.checkForMatches(this.userId);
              }
            }
          }
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string, leftPresences: any[] }) => {
          this.logDebug('User left:', key, leftPresences);
          
          if (key !== userId) {
            // Remove this user from our waiting pool
            this.waitingUsers.delete(key);
            this.logDebug(`Removed user ${key} from waiting pool, current pool:`, Array.from(this.waitingUsers.keys()));
          }
        })
        .on('broadcast', { event: 'match_accept' }, (payload) => {
          this.logDebug('Match accept broadcast received:', payload);
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
        if (status === 'SUBSCRIBED') {
          // Track our presence once subscribed
          try {
            // Fix: use a single object parameter for track() instead of multiple arguments
            await this.channel.track({
              userId: userId,
              username: user.username,
              avatarUrl: user.avatarUrl,
              looking: true,
              joinedAt: new Date().toISOString()
            });
            this.logDebug('Successfully joined matchmaking channel');
            toast.success("Connected to matchmaking service");
            this.lastPresenceUpdate = Date.now();
          } catch (trackError) {
            console.error('Error tracking presence:', trackError);
            toast.error("Failed to register in matchmaking");
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          this.logDebug(`Channel error or timeout: ${status}`, err);
          // Retry connection
          setTimeout(() => this.setupChannelWithRetry(userId, user), 2000);
        } else {
          this.logDebug('Matchmaking channel subscription status:', status);
        }
      });
    } catch (error) {
      console.error('Error in setupChannelWithRetry:', error);
      // Retry after delay
      setTimeout(() => this.setupChannelWithRetry(userId, user), 2000);
    }
  }

  private refreshPresence(userId: string, user: User): void {
    if (!this.channel) return;
    
    // Only refresh presence if more than 5 seconds have passed since last update
    const now = Date.now();
    if (now - this.lastPresenceUpdate > 5000) {
      try {
        // Fix: use a single object parameter for track() instead of multiple arguments
        this.channel.track({
          userId: userId,
          username: user.username,
          avatarUrl: user.avatarUrl,
          looking: true,
          joinedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        this.lastPresenceUpdate = now;
        this.logDebug('Refreshed presence in matchmaking channel');
      } catch (error) {
        console.error('Error refreshing presence:', error);
      }
    }
  }

  private updateWaitingUsers(state: Record<string, any[]>): void {
    // Log the raw presence state for debugging
    this.logDebug('Raw presence state:', JSON.stringify(state));
    
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
        this.logDebug(`Added user ${userId} from presence state`);
      }
    });
    
    this.logDebug("Updated waiting users:", Array.from(this.waitingUsers.keys()));
    
    // Check for matches immediately after presence sync
    if (this.userId) {
      this.checkForMatches(this.userId);
    }
  }

  public cancelMatchmaking(userId: string): void {
    this.logDebug(`User ${userId} cancelled matchmaking`);
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
      this.logDebug(`User ${userId} left battle with ${opponentId}`);
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
      this.logDebug(`User ${currentUserId} is no longer waiting for a match`);
      return;
    }
    
    const otherUsers = Array.from(this.waitingUsers.entries())
      .filter(([userId]) => userId !== currentUserId);
    
    this.logDebug(`Checking for matches for user ${currentUserId}, available users:`, 
      otherUsers.map(([id, user]) => `${id} (${user.username})`));
    
    if (otherUsers.length === 0) {
      this.logDebug(`No other users available for user ${currentUserId}`);
      return;
    }

    // Find the first available user
    const [opponentId, opponent] = otherUsers[0];
    this.logDebug(`Found a potential match between ${currentUserId} and ${opponentId}`);
    
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
        this.logDebug(`Match request sent to ${opponentId}`);
        
        // Auto-accept after a short delay
        // This helps when there are network issues or sync issues
        setTimeout(() => {
          if (this.waitingUsers.has(currentUserId) && this.waitingUsers.has(opponentId)) {
            this.acceptMatch(currentUserId, opponentId);
          }
        }, 2000);
      } catch (error) {
        console.error('Error sending match request:', error);
      }
    }
  }

  private acceptMatch(currentUserId: string, opponentId: string): void {
    if (!this.waitingUsers.has(currentUserId) || !this.waitingUsers.has(opponentId)) {
      this.logDebug(`Accept match failed: one of the users not available`, 
        {currentUserAvailable: this.waitingUsers.has(currentUserId), 
         opponentAvailable: this.waitingUsers.has(opponentId)});
      return;
    }
    
    this.logDebug(`Accepting match between ${currentUserId} and ${opponentId}`);
    
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
