import { DeadLetterQueue as IDeadLetterQueue, MessageEnvelope } from "./IMessageBroker.js";

/**
 * DeadLetterQueue archiving failed event packets.
 */
export class DeadLetterQueue implements IDeadLetterQueue {
  private readonly items: Array<{ topic: string; envelope: MessageEnvelope; error: string }> = [];

  public enqueue(topic: string, envelope: MessageEnvelope, error: string): void {
    this.items.push({ topic, envelope, error });
  }

  public list(): readonly Array<{ topic: string; envelope: MessageEnvelope; error: string }> {
    return Object.freeze([...this.items]);
  }

  public clear(): void {
    this.items.length = 0;
  }
}
