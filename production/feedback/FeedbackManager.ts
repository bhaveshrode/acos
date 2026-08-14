/**
 * FeedbackManager collecting prioritized customer notes.
 */
export class FeedbackManager {
  private readonly reports: Array<{ userId: string; comment: string; priority: number }> = [];

  public submitFeedback(userId: string, comment: string, priority = 3): void {
    this.reports.push({ userId, comment, priority });
  }

  public getBacklog(): readonly Array<{ userId: string; comment: string; priority: number }> {
    // Sort by priority (higher priority first)
    return Object.freeze(
      [...this.reports].sort((a, b) => b.priority - a.priority)
    );
  }

  public clear(): void {
    this.reports.length = 0;
  }
}
