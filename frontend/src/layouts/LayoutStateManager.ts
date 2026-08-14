/**
 * LayoutStateManager logging active transitions and structures configurations states.
 */
export class LayoutStateManager {
  private activeLayoutId?: string;

  public transitionTo(layoutId: string): void {
    this.activeLayoutId = layoutId;
  }

  public getActiveLayoutId(): string | undefined {
    return this.activeLayoutId;
  }
}
