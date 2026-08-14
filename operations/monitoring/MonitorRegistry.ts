/**
 * MonitorRegistry cataloging resource monitors.
 */
export class MonitorRegistry {
  private readonly catalog = new Map<string, any>();

  public register(name: string, monitor: any): void {
    this.catalog.set(name, monitor);
  }

  public get(name: string): any {
    return this.catalog.get(name);
  }
}
