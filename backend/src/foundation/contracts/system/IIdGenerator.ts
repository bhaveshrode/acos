/**
 * Interface representing a unique ID generation capability (e.g. UUID, ULID).
 */
export interface IIdGenerator {
  /**
   * Generates a unique string identifier.
   */
  nextId(): string;
}
