/**
 * DependencyComposer mapping dependency edges lists.
 */
export class DependencyComposer {
  private readonly graph = new Map<string, string[]>();

  public registerDependency(component: string, dependencies: string[]): void {
    this.graph.set(component, dependencies);
  }

  public getDependencies(component: string): string[] | undefined {
    return this.graph.get(component);
  }
}
