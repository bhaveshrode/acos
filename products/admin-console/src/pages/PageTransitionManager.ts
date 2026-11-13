/**
 * PageTransitionManager tracking page entry and exit transition cycles.
 */
export class PageTransitionManager {
  private isTransitioning: boolean = false;

  public async transitionTo(transitionFn: () => Promise<void> | void): Promise<void> {
    this.isTransitioning = true;
    await transitionFn();
    this.isTransitioning = false;
  }

  public getIsTransitioning(): boolean {
    return this.isTransitioning;
  }
}
