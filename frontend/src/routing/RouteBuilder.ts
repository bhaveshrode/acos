import { RouteDefinition } from "./RouteDefinition.js";
import { IRouteGuard } from "./IRouteGuard.js";

/**
 * RouteBuilder supplying a fluent API for assembling route definitions.
 */
export class RouteBuilder {
  private path: string = "";
  private name?: string;
  private component?: any;
  private layout?: string;
  private readonly guards: IRouteGuard[] = [];
  private readonly children: RouteDefinition[] = [];
  private meta: Record<string, any> = {};

  public setPath(path: string): this {
    this.path = path;
    return this;
  }

  public setName(name: string): this {
    this.name = name;
    return this;
  }

  public setComponent(component: any): this {
    this.component = component;
    return this;
  }

  public setLayout(layout: string): this {
    this.layout = layout;
    return this;
  }

  public addGuard(guard: IRouteGuard): this {
    this.guards.push(guard);
    return this;
  }

  public addChild(child: RouteDefinition): this {
    this.children.push(child);
    return this;
  }

  public addMeta(key: string, value: any): this {
    this.meta[key] = value;
    return this;
  }

  public build(): RouteDefinition {
    return {
      path: this.path,
      name: this.name,
      component: this.component,
      layout: this.layout,
      guards: this.guards.length > 0 ? [...this.guards] : undefined,
      children: this.children.length > 0 ? [...this.children] : undefined,
      meta: Object.keys(this.meta).length > 0 ? { ...this.meta } : undefined
    };
  }
}
