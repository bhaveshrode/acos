import { RuntimeEventBus } from "./RuntimeEventBus.js";

/**
 * EventRecoveryManager managing recoveries of dead letter queue logs.
 */
export class EventRecoveryManager {
  constructor(private readonly bus: RuntimeEventBus) {}

  public async retryDeadLetters(): Promise<number> {
    const deadLetters = this.bus.getDeadLetters();
    let retriedCount = 0;

    for (const dl of deadLetters) {
      const success = await this.bus.publish(dl.topic, dl.payload);
      if (success) {
        retriedCount++;
      }
    }

    return retriedCount;
  }
}
