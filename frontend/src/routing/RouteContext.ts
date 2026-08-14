/**
 * RouteContext representing the active navigation snapshot.
 */
export class RouteContext {
  constructor(
    public readonly path: string,
    public readonly params: Readonly<Record<string, string>>,
    public readonly query: Readonly<Record<string, string>>,
    public readonly meta: Readonly<Record<string, any>> = {}
  ) {
    Object.freeze(this.params);
    Object.freeze(this.query);
    Object.freeze(this.meta);
    Object.freeze(this);
  }
}
