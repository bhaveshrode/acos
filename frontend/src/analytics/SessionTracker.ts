/**
 * SessionTracker monitoring user sessions.
 */
export class SessionTracker {
  private activeSessionId?: string;
  private lastActivityTime: number = Date.now();

  public startSession(sessionId: string): void {
    this.activeSessionId = sessionId;
    this.lastActivityTime = Date.now();
  }

  public recordActivity(): void {
    this.lastActivityTime = Date.now();
  }

  public getSessionId(): string | undefined {
    return this.activeSessionId;
  }

  public getLastActivityTime(): number {
    return this.lastActivityTime;
  }
}
