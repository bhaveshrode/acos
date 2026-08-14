import { EndpointDocument } from "./EndpointDocument.js";
import { SchemaDocument } from "./SchemaDocument.js";

/**
 * ApiDocument representing the complete API specification layout.
 */
export class ApiDocument {
  constructor(
    public readonly title: string,
    public readonly version: string,
    public readonly endpoints: EndpointDocument[] = [],
    public readonly schemas: SchemaDocument[] = []
  ) {}
}
