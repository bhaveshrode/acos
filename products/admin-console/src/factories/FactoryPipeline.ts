/**
 * FactoryPipeline executing factories initializations sequentially.
 */
export class FactoryPipeline {
  private readonly factories: { id: string; init: () => void }[] = [];

  public addFactory(id: string, init: () => void): void {
    this.factories.push({ id, init });
  }

  public run(): void {
    for (const item of this.factories) {
      item.init();
    }
  }
}
