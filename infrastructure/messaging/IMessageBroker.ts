export interface MessageEnvelope {
  id: string;
  topic: string;
  payload: any;
  timestamp: Date;
}

/**
 * IMessageBroker declaring standard message exchange patterns.
 */
export interface IMessageBroker {
  publish(topic: string, payload: any): Promise<boolean>;
  subscribe(topic: string, queueName: string, consumer: (msg: MessageEnvelope) => Promise<void>): Promise<void>;
  getDLQ(): DeadLetterQueue;
}

export interface DeadLetterQueue {
  enqueue(topic: string, envelope: MessageEnvelope, error: string): void;
  list(): readonly Array<{ topic: string; envelope: MessageEnvelope; error: string }>;
}
