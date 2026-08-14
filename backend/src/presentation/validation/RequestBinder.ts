/**
 * RequestBinder converting raw request slots (body, query, route variables) to strongly typed DTO mappings.
 */
export class RequestBinder {
  public bind<T>(req: any): T {
    return {
      ...req.params,
      ...req.query,
      ...req.body
    } as T;
  }
}
