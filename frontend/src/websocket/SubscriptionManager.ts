/**
 * SubscriptionManager tracking active topic subscriptions.
 */
export class SubscriptionManager {
  private readonly subscriptions = new Set<string>();

  public subscribe(topic: string): void {
    this.subscriptions.add(topic);
  }

  public unsubscribe(topic: string): void {
    this.subscriptions.delete(topic);
  }

  public getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }
}
