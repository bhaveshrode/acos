/**
 * ResponseMetadataBuilder appending processed timestamps and execution timings metrics.
 */
export class ResponseMetadataBuilder {
  public static build(executionTimeMs?: number, correlationId?: string): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      correlationId,
      executionTimeMs
    };
  }
}
