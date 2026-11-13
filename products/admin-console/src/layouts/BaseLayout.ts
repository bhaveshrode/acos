import { ILayout } from "./ILayout.js";
import { LayoutContext } from "./LayoutContext.js";
import { LayoutState } from "./LayoutState.js";

/**
 * BaseLayout implementing structural rendering orchestration and region properties maps.
 */
export abstract class BaseLayout implements ILayout {
  public state: LayoutState = LayoutState.Initializing;
  protected readonly regions = new Map<string, string>();

  constructor(public context: LayoutContext) {}

  public abstract render(): string;

  public mount(element: any): void {
    this.state = LayoutState.Active;
    this.onMount(element);
  }

  public update(nextContext: LayoutContext): void {
    this.context = nextContext;
    this.state = LayoutState.Rendering;
    this.onUpdate();
    this.state = LayoutState.Active;
  }

  public unmount(): void {
    this.state = LayoutState.Destroyed;
    this.onDestroy();
    this.regions.clear();
  }

  protected onMount(element: any): void {}
  protected onUpdate(): void {}
  protected onDestroy(): void {}

  public registerRegion(name: string, content: string): void {
    this.regions.set(name, content);
  }

  public getRegion(name: string): string | undefined {
    return this.regions.get(name);
  }
}
