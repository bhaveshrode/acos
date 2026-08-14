import { IPage } from "./IPage.js";
import { PageContext } from "./PageContext.js";
import { PageState } from "./PageState.js";

/**
 * BasePage implementing lifecycles, element collections, and data resolvers.
 */
export abstract class BasePage implements IPage {
  public state: PageState = PageState.Initializing;
  protected readonly elements = new Map<string, string>();

  constructor(public context: PageContext) {}

  public abstract render(): string;

  public mount(element: any): void {
    this.state = PageState.Ready;
    this.onMount(element);
  }

  public update(nextContext: PageContext): void {
    this.context = nextContext;
    this.state = PageState.Loading;
    this.onUpdate();
    this.state = PageState.Ready;
  }

  public unmount(): void {
    this.state = PageState.Destroyed;
    this.onDestroy();
    this.elements.clear();
  }

  public async loadData(): Promise<void> {
    this.state = PageState.Loading;
    await this.onLoadData();
    this.state = PageState.Ready;
  }

  protected onMount(element: any): void {}
  protected onUpdate(): void {}
  protected onDestroy(): void {}
  protected async onLoadData(): Promise<void> {}

  public registerElement(name: string, content: string): void {
    this.elements.set(name, content);
  }

  public getElement(name: string): string | undefined {
    return this.elements.get(name);
  }
}
