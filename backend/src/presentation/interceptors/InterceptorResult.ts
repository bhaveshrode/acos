/**
 * InterceptorResult wrapping intercepted outcomes and transformed values.
 */
export class InterceptorResult {
  private constructor(
    public readonly handled: boolean,
    public readonly shortCircuit: boolean,
    public readonly value?: any
  ) {}

  public static next(): InterceptorResult {
    return new InterceptorResult(false, false);
  }

  public static shortCircuit(value: any): InterceptorResult {
    return new InterceptorResult(true, true, value);
  }
}
