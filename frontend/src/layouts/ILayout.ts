import { LayoutContext } from "./LayoutContext.js";
import { LayoutState } from "./LayoutState.js";

/**
 * ILayout interface defining mounting, updating, and unmounting capabilities.
 */
export interface ILayout {
  context: LayoutContext;
  state: LayoutState;
  render(): string;
  mount(element: any): void;
  update(nextContext: LayoutContext): void;
  unmount(): void;
}
