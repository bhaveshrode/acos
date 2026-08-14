import { ApiDocument } from "./ApiDocument.js";
import { DocumentationRegistry } from "./DocumentationRegistry.js";
import { DocumentationOptions } from "./DocumentationOptions.js";

/**
 * DocumentationGenerator consolidating all metadata into single API specification documents.
 */
export class DocumentationGenerator {
  constructor(private readonly options: DocumentationOptions) {}

  public generate(): ApiDocument {
    return new ApiDocument(
      this.options.title,
      this.options.version,
      DocumentationRegistry.getEndpoints(),
      DocumentationRegistry.getSchemas()
    );
  }
}
