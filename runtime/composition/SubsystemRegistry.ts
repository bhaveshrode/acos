import { SubsystemDescriptor } from "./SubsystemDescriptor.js";

/**
 * SubsystemRegistry cataloging ACOS subsystems.
 */
export class SubsystemRegistry {
  private readonly subsystems = new Map<string, SubsystemDescriptor>();

  public register(descriptor: SubsystemDescriptor): void {
    this.subsystems.set(descriptor.name.toLowerCase(), descriptor);
  }

  public get(name: string): SubsystemDescriptor | undefined {
    return this.subsystems.get(name.toLowerCase());
  }

  public list(): SubsystemDescriptor[] {
    return Array.from(this.subsystems.values());
  }

  public clear(): void {
    this.subsystems.clear();
  }
}
