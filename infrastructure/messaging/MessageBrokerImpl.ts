import { IMessageBroker, MessageEnvelope } from "./IMessageBroker.js";
import { DeadLetterQueue } from "./DeadLetterQueue.js";

/**
 * MessageBrokerImpl implementing IMessageBroker.
 */
export class MessageBrokerImpl implements IMessageBroker {
  private readonly consumers = new Map<string, Array<{ queue: string; cb: (msg: MessageEnvelope) => Promise<void> }>>();
  private readonly dlq = new DeadLetterQueue();

  public async publish(topic: string, payload: any): Promise<boolean> {
    const key = topic.toLowerCase();
    const list = this.consumers.get(key) ?? [];
    let allOk = true;

    const envelope: MessageEnvelope = {
      id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      topic,
      payload,
      timestamp: new Date()
    };

    for (const item of list) {
      try {
        await item.cb(envelope);
      } catch (err: any) {
        allOk = false;
        this.dlq.enqueue(topic, envelope, err.message);
      }
    }

    return allOk;
  }

  public async subscribe(
    topic: string,
    queueName: string,
    consumer: (msg: MessageEnvelope) => Promise<void>
  ): Promise<void> {
    const key = topic.toLowerCase();
    if (!this.consumers.has(key)) {
      this.consumers.set(key, []);
    }
    this.consumers.get(key)!.push({ queue: queueName, cb: consumer });
  }

  public getDLQ(): DeadLetterQueue {
    return this.dlq;
  }

  public clear(): void {
    this.consumers.clear();
    this.dlq.clear();
  }
}
