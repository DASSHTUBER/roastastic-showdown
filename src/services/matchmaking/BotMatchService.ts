
import { DebugLogger } from './DebugLogger';
import { User } from './types';

export class BotMatchService {
  private botMatchTimeout: NodeJS.Timeout | null = null;
  private botMatchEnabled: boolean = true;
  private userJoinTimes: Map<string, number> = new Map();
  private botNames: string[] = [
    "RoastMaster3000", 
    "BurnBot", 
    "SavageAI", 
    "CyberRoaster", 
    "JokeSlayer", 
    "PunchlinePro",
    "CandyCrusher", 
    "SweetBurn", 
    "SugarRoast",
    "GummyTroll"
  ];

  constructor() {
    DebugLogger.log("Bot match service initialized");
  }

  public isBotMatchEnabled(): boolean {
    return this.botMatchEnabled;
  }

  public setBotMatchEnabled(enabled: boolean): void {
    this.botMatchEnabled = enabled;
  }

  public setBotMatchTimeout(callback: () => void, delay: number): void {
    this.clearBotMatchTimeout();
    this.botMatchTimeout = setTimeout(callback, delay);
    DebugLogger.log(`Bot match timeout set for ${delay}ms`);
  }

  public clearBotMatchTimeout(): void {
    if (this.botMatchTimeout) {
      clearTimeout(this.botMatchTimeout);
      this.botMatchTimeout = null;
      DebugLogger.log("Bot match timeout cleared");
    }
  }

  public createBotOpponent(): User {
    const randomName = this.botNames[Math.floor(Math.random() * this.botNames.length)];
    const botId = `bot_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    const botUser: User = {
      id: botId,
      username: randomName,
      avatarUrl: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${randomName}`,
      isBot: true,
      status: 'matched'
    };
    
    DebugLogger.log(`Created bot opponent: ${randomName} (${botId})`);
    return botUser;
  }
  
  // Track when a user joins matchmaking to determine when to match with bots
  public trackUserJoin(userId: string): void {
    this.userJoinTimes.set(userId, Date.now());
  }
  
  // Get the time when a user joined matchmaking
  public getUserJoinTime(userId: string): number | undefined {
    return this.userJoinTimes.get(userId);
  }
  
  // Remove user from join tracking when they leave matchmaking
  public removeUserJoin(userId: string): void {
    this.userJoinTimes.delete(userId);
  }
}
