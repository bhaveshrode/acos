/**
 * ErrorTracker gathering unhandled frontend exception payloads.
 */
export class ErrorTracker {
  private readonly errors: any[] = [];

  public trackError(error: any): void {
    this.errors.push(error);
  }

  public getErrors(): any[] {
    return [...this.errors];
  }
}
