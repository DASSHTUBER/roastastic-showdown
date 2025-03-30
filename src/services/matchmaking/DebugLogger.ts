
export class DebugLogger {
  private debugMode: boolean;

  constructor(debugMode: boolean = false) {
    this.debugMode = debugMode;
  }

  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  public log(message: string, data?: any): void {
    if (this.debugMode) {
      if (data) {
        console.log(`[Matchmaking] ${message}`, data);
      } else {
        console.log(`[Matchmaking] ${message}`);
      }
    }
  }

  public error(message: string, error: any): void {
    console.error(`[Matchmaking Error] ${message}`, error);
  }
}
