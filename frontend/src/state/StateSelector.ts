/**
 * StateSelector supplying static memoized selections checks over state parameters.
 */
export class StateSelector {
  private static readonly cache = new Map<string, { inputs: any[]; output: any }>();

  public static select<S, T>(
    state: S,
    selectorFn: (state: S) => T,
    cacheKey?: string
  ): T {
    if (!cacheKey) {
      return selectorFn(state);
    }

    const cached = this.cache.get(cacheKey);
    if (cached && cached.inputs.length === 1 && cached.inputs[0] === state) {
      return cached.output;
    }

    const output = selectorFn(state);
    this.cache.set(cacheKey, { inputs: [state], output });
    return output;
  }

  public static clearCache(): void {
    this.cache.clear();
  }
}
