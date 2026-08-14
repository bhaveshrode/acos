import { EndpointDocument } from "./EndpointDocument.js";
import { SchemaDocument } from "./SchemaDocument.js";

/**
 * DocumentationRegistry maintaining dynamically registered API endpoints and schema specifications.
 */
export class DocumentationRegistry {
  private static endpoints: EndpointDocument[] = [];
  private static schemas: SchemaDocument[] = [];

  public static registerEndpoint(ep: EndpointDocument): void {
    this.endpoints.push(ep);
  }

  public static registerSchema(sch: SchemaDocument): void {
    this.schemas.push(sch);
  }

  public static getEndpoints(): EndpointDocument[] {
    return this.endpoints;
  }

  public static getSchemas(): SchemaDocument[] {
    return this.schemas;
  }

  /**
   * Resets registry records.
   */
  public static clear(): void {
    this.endpoints = [];
    this.schemas = [];
  }
}
