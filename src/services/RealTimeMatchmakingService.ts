
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
    
    // Set an interval to check for matchmaking timeouts
    this.checkInterval = window.setInterval(() => {
      this.checkForMatches(userId);
    }, 2000);
    
    // Set bot match timeout
    this.botMatchService.setBotMatchTimeout(() => {
      if (this.waitingUsers.has(userId)) {
        const otherUsers = Array.from(this.waitingUsers.keys()).filter(id => id !== userId);
        if (otherUsers.length === 0) {
          const noUsersCallback = this.noUsersCallbacks.get(userId);
          if (noUsersCallback) {
            noUsersCallback();
          }
        }
      }
    });
  }

  private setupRealtimeChannel(userId: string, user: User): void {
    // First, clean up any existing channel
    if (this.channel) {
      supabase.removeChannel(this.channel);
    }

    // Create a new channel for matchmaking
    this.channel = supabase.channel('matchmaking', {
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
          }
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: { key: string, leftPresences: any[] }) => {
        console.log('User left:', key, leftPresences);
        
        if (key !== userId) {
          // Remove this user from our waiting pool
          this.waitingUsers.delete(key);
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

    // Subscribe to the channel
    this.channel.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        // Track our presence once subscribed
        await this.channel.track({
          userId: userId,
          username: user.username,
          avatarUrl: user.avatarUrl,
          looking: true,
          joinedAt: new Date().toISOString()
        });
        console.log('Successfully joined matchmaking channel');
      } else {
        console.log('Matchmaking channel subscription status:', status);
      }
    });
  }

  private updateWaitingUsers(state: Record<string, any[]>): void {
    // Reset waiting users based on current presence state
    this.waitingUsers.clear();
    
    // Add all users from presence state
    Object.entries(state).forEach(([userId, presences]) => {
      const userPresence = presences[0];
      if (userPresence && userPresence.looking) {
        const user: User = {
          id: userId,
          username: userPresence.username || `User_${userId.slice(0, 4)}`,
          avatarUrl: userPresence.avatarUrl
        };
        this.waitingUsers.set(userId, user);
      }
    });
    
    // Add ourselves back if we're still looking
    if (this.userId && this.username) {
      const user: User = {
        id: this.userId,
        username: this.username,
        avatarUrl: this.avatarUrl
      };
      this.waitingUsers.set(this.userId, user);
    }
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
      this.channel.untrack();
      supabase.removeChannel(this.channel);
      this.channel = null;
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
      this.channel.untrack();
      supabase.removeChannel(this.channel);
      this.channel = null;
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
      this.channel.untrack();
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  public isBotMatchEnabled(): boolean {
    return this.botMatchService.isBotMatchEnabled();
  }

  private checkForMatches(currentUserId: string): void {
    if (!this.waitingUsers.has(currentUserId)) {
      return;
    }
    
    for (const [userId, user] of this.waitingUsers.entries()) {
      if (userId !== currentUserId) {
        console.log(`Found a potential match between ${currentUserId} and ${userId}`);
        
        // Initiate match with this user
        this.channel.send({
          type: 'broadcast',
          event: 'match_accept',
          payload: {
            senderId: currentUserId,
            targetId: userId
          }
        });
        
        // Break after finding one potential match
        break;
      }
    }
  }

  private acceptMatch(currentUserId: string, opponentId: string): void {
    if (!this.waitingUsers.has(currentUserId) || !this.waitingUsers.has(opponentId)) {
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
