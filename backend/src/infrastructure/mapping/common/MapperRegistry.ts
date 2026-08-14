import { MapperBase } from "./MapperBase.js";

/**
 * Static mapper lookup cache catalog.
 */
export class MapperRegistry {
  private static mappers: Map<string, MapperBase<any, any>> = new Map();

  /**
   * Registers a mapper instance under a composite key.
   */
  public static register<TSource, TTarget>(
    sourceName: string,
    targetName: string,
    mapper: MapperBase<TSource, TTarget>
  ): void {
    const key = `${sourceName}->${targetName}`;
    this.mappers.set(key, mapper);
  }

  /**
   * Resolves a mapper instance for the specified target conversion.
   */
  public static get<TSource, TTarget>(
    sourceName: string,
    targetName: string
  ): MapperBase<TSource, TTarget> {
    const key = `${sourceName}->${targetName}`;
    const mapper = this.mappers.get(key);
    if (!mapper) {
      throw new Error(`No mapper registered for conversion key: ${key}`);
    }
    return mapper;
  }

  /**
   * Empties registry items.
   */
  public static clear(): void {
    this.mappers.clear();
  }
}
