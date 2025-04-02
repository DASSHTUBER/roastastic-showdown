
export class DebugLogger {
  private static debugMode: boolean = true;
  private static prefix: string = "Matchmaking";

  public static setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  public static log(message: string, data?: any): void {
    if (this.debugMode) {
      if (data) {
        console.log(`[${this.prefix}] ${message}`, data);
      } else {
        console.log(`[${this.prefix}] ${message}`);
      }
    }
  }

  public static error(message: string, error: any): void {
    console.error(`[${this.prefix} Error] ${message}`, error);
  }

  public static warn(message: string, data?: any): void {
    console.warn(`[${this.prefix} Warning] ${message}`, data ? data : '');
  }
}
