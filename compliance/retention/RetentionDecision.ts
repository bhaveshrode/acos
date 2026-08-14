/**
 * RetentionDecision mapping outcomes.
 */
export class RetentionDecision {
  constructor(
    public readonly shouldPurge: boolean,
    public readonly reason: string,
    public readonly timestamp: Date = new Date()
  ) {
    Object.freeze(this);
  }
}
