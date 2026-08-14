import { ComponentContext } from "./ComponentContext.js";
import { ComponentState } from "./ComponentState.js";

/**
 * IComponent representing base capabilities contract.
 */
export interface IComponent<P = any> {
  context: ComponentContext;
  props: P;
  state: ComponentState;
  render(): string;
  mount(element: any): void;
  update(nextProps: P): void;
  unmount(): void;
  addChild(child: IComponent): void;
}
