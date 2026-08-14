/**
 * LogEntry wrapping structured logging fields.
 */
export class LogEntry {
  constructor(
    public readonly level: string,
    public readonly message: string,
    public readonly timestamp: number = Date.now(),
    public readonly metadata: Record<string, any> = {}
  ) {
    Object.freeze(this.metadata);
    Object.freeze(this);
  }
}
