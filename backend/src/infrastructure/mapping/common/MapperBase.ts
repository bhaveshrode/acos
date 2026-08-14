/**
 * Abstract generic base mapping class.
 */
export abstract class MapperBase<TSource, TTarget> {
  /**
   * Transforms a single source instance to target class structure.
   */
  public abstract map(source: TSource): TTarget;

  /**
   * Transforms a collection array of source instances to targets.
   */
  public mapArray(sourceArray: TSource[]): TTarget[] {
    return sourceArray.map((item) => this.map(item));
  }
}
