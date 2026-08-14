/**
 * FilterContext carrying request and response context metadata maps.
 */
export class FilterContext {
  constructor(
    public readonly request: any,
    public readonly response: any,
    public readonly metadata: Record<string, any> = {}
  ) {}
}
