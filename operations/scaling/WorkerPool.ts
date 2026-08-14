/**
 * WorkerPool managing scaled worker counts.
 */
export class WorkerPool {
  private count: number = 3;

  public getWorkerCount(): number {
    return this.count;
  }

  public resize(count: number): void {
    this.count = count;
  }
}
