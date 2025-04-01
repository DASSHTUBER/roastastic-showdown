
export class DebugLogger {
  private debugMode: boolean;
  private prefix: string;

  constructor(prefix: string = "Debug", debugMode: boolean = false) {
    this.prefix = prefix;
    this.debugMode = debugMode;
  }

  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  public log(message: string, data?: any): void {
    if (this.debugMode) {
      if (data) {
        console.log(`[${this.prefix}] ${message}`, data);
      } else {
        console.log(`[${this.prefix}] ${message}`);
      }
    }
  }

  public error(message: string, error: any): void {
    console.error(`[${this.prefix} Error] ${message}`, error);
  }
}
