/**
 * Release representing a deploy candidate.
 */
export class Release {
  constructor(
    public readonly version: string,
    public readonly description: string,
    public readonly timestamp: Date = new Date()
  ) {
    Object.freeze(this);
  }
}
