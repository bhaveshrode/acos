/**
 * LoadBalancer choosing downstream hosts in round-robin turns.
 */
export class LoadBalancer {
  private index: number = 0;

  public selectTarget(targets: string[]): string {
    if (targets.length === 0) throw new Error("No load balancer targets");
    const target = targets[this.index % targets.length];
    this.index++;
    return target;
  }
}
