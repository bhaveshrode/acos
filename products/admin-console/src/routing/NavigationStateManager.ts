/**
 * NavigationStateManager managing transition payload states.
 */
export class NavigationStateManager {
  private state: Record<string, any> = {};

  public setState(state: Record<string, any>): void {
    this.state = { ...state };
  }

  public getState(): Record<string, any> {
    return { ...this.state };
  }

  public clear(): void {
    this.state = {};
  }
}
