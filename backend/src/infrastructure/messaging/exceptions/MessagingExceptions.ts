/**
 * Base messaging infrastructure exception.
 */
export class MessagingException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MessagingException";
  }
}

/**
 * Thrown when event publication fails.
 */
export class PublishFailedException extends MessagingException {
  constructor(message: string) {
    super(`Publish failed: ${message}`);
    this.name = "PublishFailedException";
  }
}

/**
 * Thrown when subscriber registration fails.
 */
export class SubscriberException extends MessagingException {
  constructor(message: string) {
    super(`Subscription registration failed: ${message}`);
    this.name = "SubscriberException";
  }
}

/**
 * Thrown when JSON serialization/deserialization fails.
 */
export class SerializationException extends MessagingException {
  constructor(message: string) {
    super(`Serialization failed: ${message}`);
    this.name = "SerializationException";
  }
}
