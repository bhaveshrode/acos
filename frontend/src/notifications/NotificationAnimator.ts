/**
 * NotificationAnimator coordinating entry/exit animation checks.
 */
export class NotificationAnimator {
  private isAnimating: boolean = false;

  public animate(animationFn: () => void): void {
    this.isAnimating = true;
    animationFn();
    this.isAnimating = false;
  }

  public getIsAnimating(): boolean {
    return this.isAnimating;
  }
}
