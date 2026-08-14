import { DocumentationGenerator } from "./DocumentationGenerator.js";
import { OpenApiBuilder } from "./OpenApiBuilder.js";

/**
 * DocumentationController exposing HTTP endpoints for specification payload lookups.
 */
export class DocumentationController {
  constructor(
    private readonly generator: DocumentationGenerator,
    private readonly openApiBuilder: OpenApiBuilder
  ) {}

  public handleDocs(): { statusCode: number; payload: any } {
    const doc = this.generator.generate();
    const spec = this.openApiBuilder.build(doc);
    return {
      statusCode: 200,
      payload: spec
    };
  }
}
