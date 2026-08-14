/**
 * BackgroundJob wrapping asynchronous execution operations.
 */
export class BackgroundJob {
  constructor(
    public readonly id: string,
    public readonly task: () => Promise<void>
  ) {
    Object.freeze(this);
  }
}
