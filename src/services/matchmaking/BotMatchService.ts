
import { User } from './types';

export class BotMatchService {
  private botMatchTimeout: number | null = null;
  private botMatchEnabled: boolean = true;
  private botUsernames: string[] = [
    'RoastBot3000',
    'SweetRoaster',
    'CandyRoaster',
    'SugarCoatedBurn',
    'AI_Roastmaster',
    'CyberRoaster',
    'SweetToothTroll',
    'GummyBearRoaster',
    'LollipopBurner',
    'BotOfBurns'
  ];

  public createBotUser(): User {
    const randomUsername = this.botUsernames[Math.floor(Math.random() * this.botUsernames.length)];
    
    return {
      id: `bot-${Date.now()}`,
      username: randomUsername,
      isBot: true
    };
  }

  public createBotOpponent(): User {
    return this.createBotUser();
  }

  public resetBotMatch(): void {
    this.clearBotMatchTimeout();
  }

  public setBotMatchTimeout(callback: () => void, delay: number = 15000): void {
    this.clearBotMatchTimeout();
    this.botMatchTimeout = window.setTimeout(callback, delay);
  }

  public clearBotMatchTimeout(): void {
    if (this.botMatchTimeout !== null) {
      clearTimeout(this.botMatchTimeout);
      this.botMatchTimeout = null;
    }
  }

  public isBotMatchEnabled(): boolean {
    return this.botMatchEnabled;
  }
}
