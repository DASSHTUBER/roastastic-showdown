
import { User } from './types';

export class BotMatchService {
  private botMatchEnabled: boolean = false;
  private botMatchDelayMs: number = 15000; // 15 seconds delay before bot match
  private botMatchTimeout: number | null = null;

  constructor() {
    this.resetBotMatch();
  }

  public resetBotMatch(): void {
    this.botMatchEnabled = false;
    if (this.botMatchTimeout) {
      clearTimeout(this.botMatchTimeout);
      this.botMatchTimeout = null;
    }
  }

  public setBotMatchTimeout(callback: () => void): void {
    this.botMatchTimeout = window.setTimeout(() => {
      this.botMatchEnabled = true;
      callback();
    }, this.botMatchDelayMs);
  }

  public clearBotMatchTimeout(): void {
    if (this.botMatchTimeout) {
      clearTimeout(this.botMatchTimeout);
      this.botMatchTimeout = null;
    }
  }

  public isBotMatchEnabled(): boolean {
    return this.botMatchEnabled;
  }

  public createBotOpponent(): User {
    return {
      id: `bot-${Date.now()}`,
      username: `RoastBot_${Math.floor(Math.random() * 999)}`,
      avatarUrl: "https://api.dicebear.com/6.x/bottts/svg?seed=roastbattle",
      isBot: true
    };
  }
}
