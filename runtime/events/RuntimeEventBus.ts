/**
 * RuntimeEventBus implementing system-level pub/sub events broker.
 */
export class RuntimeEventBus {
  private readonly subscribers = new Map<string, Array<(payload: any) => Promise<void>>>();
  private readonly deadLetterQueue: Array<{ topic: string; payload: any; error: string }> = [];

  public subscribe(topic: string, callback: (payload: any) => Promise<void>): () => void {
    const key = topic.toLowerCase();
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    this.subscribers.get(key)!.push(callback);

    return () => {
      const list = this.subscribers.get(key) ?? [];
      const idx = list.indexOf(callback);
      if (idx !== -1) {
        list.splice(idx, 1);
      }
    };
  }

  public async publish(topic: string, payload: any): Promise<boolean> {
    const key = topic.toLowerCase();
    const list = this.subscribers.get(key) ?? [];
    let allOk = true;

    for (const callback of list) {
      try {
        await callback(payload);
      } catch (err: any) {
        allOk = false;
        this.deadLetterQueue.push({ topic, payload, error: err.message });
      }
    }

    return allOk;
  }

  public getDeadLetters(): ReadonlyArray<{ topic: string; payload: any; error: string }> {
    return Object.freeze([...this.deadLetterQueue]);
  }

  public clear(): void {
    this.subscribers.clear();
    this.deadLetterQueue.length = 0;
  }
}
