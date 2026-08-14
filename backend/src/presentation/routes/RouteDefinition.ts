/**
 * Interface representing a single HTTP API routing endpoint definition.
 */
export interface RouteDefinition {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  handler: Function;
  middleware: Array<any>;
}
