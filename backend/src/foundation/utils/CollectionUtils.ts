/**
 * Utility containing helper methods to manipulate collections, arrays, and lists.
 */
export class CollectionUtils {
  /**
   * Returns a new array containing unique elements (removes duplicates).
   */
  public static distinct<T>(array: readonly T[]): T[] {
    if (!array) return [];
    return Array.from(new Set(array));
  }

  /**
   * Groups collection elements into a key-value record based on a key returned by keySelector.
   */
  public static groupBy<T>(
    array: readonly T[],
    keySelector: (item: T) => string
  ): Record<string, T[]> {
    if (!array) return {};
    const result: Record<string, T[]> = {};
    array.forEach((item) => {
      const key = keySelector(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
    });
    return result;
  }

  /**
   * Splits a collection into two groups: [those matching predicate, those not matching predicate].
   */
  public static partition<T>(
    array: readonly T[],
    predicate: (item: T) => boolean
  ): [T[], T[]] {
    if (!array) return [[], []];
    const pass: T[] = [];
    const fail: T[] = [];
    array.forEach((item) => {
      if (predicate(item)) {
        pass.push(item);
      } else {
        fail.push(item);
      }
    });
    return [pass, fail];
  }

  /**
   * Splits a collection into chunks of a maximum size.
   * @param array The collection to chunk.
   * @param size The maximum size of each chunk.
   */
  public static chunk<T>(array: readonly T[], size: number): T[][] {
    if (!array || size <= 0) return [];
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
