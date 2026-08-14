/**
 * CorrelationResolver extracting tracing context.
 */
export class CorrelationResolver {
  public resolve(headers: Record<string, any>): string {
    return (
      headers["x-correlation-id"] ||
      headers["correlation-id"] ||
      `corr-${Math.random().toString(36).substring(2, 11)}`
    );
  }
}
