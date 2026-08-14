import { PageContext } from "./PageContext.js";
import { PageState } from "./PageState.js";

/**
 * IPage contract interface defining mounting, updating, unmounting, and data loading routines.
 */
export interface IPage {
  context: PageContext;
  state: PageState;
  render(): string;
  mount(element: any): void;
  update(nextContext: PageContext): void;
  unmount(): void;
  loadData(): Promise<void>;
}
