/**
 * SessionManager catalog tracking active user session tokens.
 */
export class SessionManager {
  private sessions = new Set<string>();

  /**
   * Tracks an active session token.
   */
  public startSession(token: string): void {
    this.sessions.add(token);
  }

  /**
   * Removes an active session token.
   */
  public endSession(token: string): void {
    this.sessions.delete(token);
  }

  /**
   * Validates if a token session is still registered.
   */
  public isSessionActive(token: string): boolean {
    return this.sessions.has(token);
  }
}
