/**
 * ApiRequest capturing normalized request envelopes.
 */
export class ApiRequest<T = any> {
  constructor(
    public readonly body: T,
    public readonly query: Record<string, any>,
    public readonly params: Record<string, any>,
    public readonly headers: Record<string, any>
  ) {}
}
