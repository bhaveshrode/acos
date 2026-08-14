/**
 * Interface representing a DTO-to-Domain or Domain-to-DTO mapper converter.
 */
export interface IMapper<TSource, TDestination> {
  /**
   * Converts source type object into target destination type.
   */
  map(source: TSource): TDestination;
}
