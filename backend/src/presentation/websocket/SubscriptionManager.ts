/**
 * SubscriptionManager managing topic mappings for active connections.
 */
export class SubscriptionManager {
  private subscriptions = new Map<string, Set<string>>(); // topic -> connectionIds

  public subscribe(topic: string, connectionId: string): void {
    const set = this.subscriptions.get(topic) || new Set<string>();
    set.add(connectionId);
    this.subscriptions.set(topic, set);
  }

  public unsubscribe(topic: string, connectionId: string): void {
    const set = this.subscriptions.get(topic);
    if (set) {
      set.delete(connectionId);
      if (set.size === 0) {
        this.subscriptions.delete(topic);
      }
    }
  }

  public getSubscribers(topic: string): string[] {
    const set = this.subscriptions.get(topic);
    return set ? Array.from(set) : [];
  }

  public clear(): void {
    this.subscriptions.clear();
  }
}
