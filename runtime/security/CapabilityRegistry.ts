/**
 * CapabilityRegistry cataloging permitted subsystem boundaries.
 */
export class CapabilityRegistry {
  private readonly capabilities = new Map<string, Set<string>>();

  public allow(subsystem: string, targetSubsystem: string): void {
    const key = subsystem.toLowerCase();
    if (!this.capabilities.has(key)) {
      this.capabilities.set(key, new Set());
    }
    this.capabilities.get(key)!.add(targetSubsystem.toLowerCase());
  }

  public canCall(subsystem: string, targetSubsystem: string): boolean {
    const key = subsystem.toLowerCase();
    const target = targetSubsystem.toLowerCase();
    return this.capabilities.get(key)?.has(target) ?? false;
  }

  public clear(): void {
    this.capabilities.clear();
  }
}
