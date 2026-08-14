/**
 * TraceContext encapsulating trace identifiers.
 */
export class TraceContext {
  constructor(
    public readonly traceId: string,
    public readonly spanId: string,
    public readonly parentSpanId?: string
  ) {
    Object.freeze(this);
  }
}
