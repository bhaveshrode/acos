import { SchemaDocument } from "./SchemaDocument.js";

/**
 * SchemaGenerator producing reusable SchemaDocuments definitions.
 */
export class SchemaGenerator {
  public generate(name: string, type: string, properties: Record<string, any>): SchemaDocument {
    return new SchemaDocument(name, type, properties);
  }
}
