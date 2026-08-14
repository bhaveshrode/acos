import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Value Object representing a unique user session identifier.
 */
export class SessionId extends UniqueEntityID {
  constructor(value?: string) {
    super(value);
  }

  /**
   * Generates a new SessionId.
   */
  public static override generate(): SessionId {
    return new SessionId();
  }

  /**
   * Creates a SessionId from an existing UUID string.
   */
  public static override from(value: string): SessionId {
    return new SessionId(value);
  }
}
