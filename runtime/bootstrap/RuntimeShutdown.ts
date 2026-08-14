/**
 * RuntimeShutdown managing draining of system resources and loops.
 */
export class RuntimeShutdown {
  private shutdownInitiated = false;

  public async shutdown(subsystemList: string[], progressCb?: (sub: string) => void): Promise<boolean> {
    if (this.shutdownInitiated) return true;
    this.shutdownInitiated = true;

    // Shut down subsystems in reverse boot order
    const reverse = [...subsystemList].reverse();
    for (const sub of reverse) {
      if (progressCb) {
        progressCb(sub);
      }
      await new Promise((resolve) => setTimeout(resolve, 5)); // Simulate teardown latency
    }

    return true;
  }
}
