/**
 * InterceptorContext carrying request, response, and metadata context maps.
 */
export class InterceptorContext {
  constructor(
    public readonly request: any,
    public readonly response: any,
    public readonly metadata: Record<string, any> = {}
  ) {}
}
