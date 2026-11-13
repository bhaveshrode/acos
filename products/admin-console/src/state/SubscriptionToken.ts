/**
 * SubscriptionToken wrapping reactive observers disposables subscriptions.
 */
export class SubscriptionToken {
  constructor(private readonly unsubscribe: () => void) {}

  public dispose(): void {
    this.unsubscribe();
  }
}
