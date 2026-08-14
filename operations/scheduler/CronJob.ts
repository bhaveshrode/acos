/**
 * CronJob wrapping pattern matching expressions.
 */
export class CronJob {
  constructor(
    public readonly id: string,
    public readonly expression: string,
    public readonly task: () => void
  ) {
    Object.freeze(this);
  }
}
