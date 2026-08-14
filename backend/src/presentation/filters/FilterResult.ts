/**
 * FilterResult wrapping execution outcome and short-circuit status.
 */
export class FilterResult {
  private constructor(
    public readonly handled: boolean,
    public readonly shortCircuit: boolean,
    public readonly statusCode?: number,
    public readonly payload?: any
  ) {}

  public static next(): FilterResult {
    return new FilterResult(false, false);
  }

  public static shortCircuit(statusCode: number, payload?: any): FilterResult {
    return new FilterResult(true, true, statusCode, payload);
  }
}
