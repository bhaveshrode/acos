import { Lifetime } from "../lifetimes/Lifetime.js";

/**
 * Metadata definition for registered dependencies.
 */
interface ServiceRegistration {
  factory: (container: ServiceContainer) => any;
  lifetime: Lifetime;
}

/**
 * Service locator and Dependency Injection container.
 * Coordinates transient, singleton, and request-scoped lifecycles.
 */
export class ServiceContainer {
  private readonly registrations = new Map<string, ServiceRegistration>();
  private readonly singletons = new Map<string, any>();
  private readonly scopedInstances = new Map<string, any>();

  private readonly resolvingStack: string[] = [];

  constructor(
    private readonly parent: ServiceContainer | null = null,
    private readonly rootSingletons: Map<string, any> = new Map<string, any>()
  ) {}

  /**
   * Registers a factory callback mapped to a string token with a specific lifetime.
   */
  public register(
    token: string,
    factory: (container: ServiceContainer) => any,
    lifetime: Lifetime = Lifetime.TRANSIENT
  ): void {
    if (this.parent) {
      throw new Error("Cannot register services directly on a child scoped container.");
    }
    this.registrations.set(token, { factory, lifetime });
  }

  /**
   * Retrieves registration metadata by token.
   */
  public getRegistration(token: string): ServiceRegistration | undefined {
    if (this.registrations.has(token)) {
      return this.registrations.get(token);
    }
    if (this.parent) {
      return this.parent.getRegistration(token);
    }
    return undefined;
  }

  /**
   * Recursively resolves the concrete dependency mapped to the given token.
   * Throws an error if the token has not been registered.
   */
  public resolve<T>(token: string): T {
    if (this.resolvingStack.includes(token)) {
      const path = [...this.resolvingStack, token].join(" -> ");
      throw new Error(`Circular dependency detected: ${path}`);
    }

    const reg = this.getRegistration(token);
    if (!reg) {
      throw new Error(`Service '${token}' is not registered in the container.`);
    }

    this.resolvingStack.push(token);
    try {
      if (reg.lifetime === Lifetime.SINGLETON) {
        const activeSingletons = this.parent ? this.parent.rootSingletons : this.singletons;
        if (!activeSingletons.has(token)) {
          const instance = reg.factory(this);
          activeSingletons.set(token, instance);
        }
        return activeSingletons.get(token) as T;
      }

      if (reg.lifetime === Lifetime.SCOPED) {
        if (!this.scopedInstances.has(token)) {
          this.scopedInstances.set(token, reg.factory(this));
        }
        return this.scopedInstances.get(token) as T;
      }

      // TRANSIENT
      return reg.factory(this) as T;
    } finally {
      this.resolvingStack.pop();
    }
  }

  /**
   * Generates a child scoped container isolated from sister scopes but sharing root singletons.
   */
  public createScope(): ServiceContainer {
    const activeSingletons = this.parent ? this.parent.rootSingletons : this.singletons;
    return new ServiceContainer(this, activeSingletons);
  }

  /**
   * Returns a list of all unique registered tokens in this container hierarchy.
   */
  public getRegisteredTokens(): string[] {
    const tokens = Array.from(this.registrations.keys());
    if (this.parent) {
      tokens.push(...this.parent.getRegisteredTokens());
    }
    return Array.from(new Set(tokens));
  }
}
