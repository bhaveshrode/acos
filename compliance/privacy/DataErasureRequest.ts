/**
 * DataErasureRequest carrying erasure demands.
 */
export class DataErasureRequest {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public readonly timestamp: Date = new Date()
  ) {
    Object.freeze(this);
  }
}
