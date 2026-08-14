/**
 * FactoryContext carrying applications dependency containers and configuration options.
 */
export class FactoryContext {
  constructor(
    public readonly container: any,
    public readonly options: Record<string, any> = {}
  ) {}
}
