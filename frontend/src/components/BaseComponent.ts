import { IComponent } from "./IComponent.js";
import { ComponentContext } from "./ComponentContext.js";
import { ComponentState } from "./ComponentState.js";

/**
 * BaseComponent implementing IComponent contract.
 */
export abstract class BaseComponent<P = any> implements IComponent<P> {
  public state: ComponentState = ComponentState.Created;
  protected readonly children = new Set<IComponent>();

  constructor(
    public readonly context: ComponentContext,
    public readonly props: P
  ) {}

  public abstract render(): string;

  public mount(element: any): void {
    this.state = ComponentState.Mounted;
    this.onMount(element);
  }

  public update(nextProps: P): void {
    this.state = ComponentState.Updating;
    this.onUpdate(nextProps);
    this.state = ComponentState.Mounted;
  }

  public unmount(): void {
    this.state = ComponentState.Unmounted;
    this.onDestroy();
    for (const child of this.children) {
      child.unmount();
    }
    this.children.clear();
  }

  protected onMount(element: any): void {}
  protected onUpdate(nextProps: P): void {}
  protected onDestroy(): void {}

  public addChild(child: IComponent): void {
    this.children.add(child);
  }
}
