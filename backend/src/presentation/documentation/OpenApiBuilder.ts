import { ApiDocument } from "./ApiDocument.js";

/**
 * OpenApiBuilder compiling ApiDocuments to OpenAPI specification documents.
 */
export class OpenApiBuilder {
  public build(doc: ApiDocument): any {
    const paths: Record<string, any> = {};
    for (const ep of doc.endpoints) {
      const pathObj = paths[ep.path] || {};
      pathObj[ep.method.toLowerCase()] = {
        summary: ep.summary,
        parameters: ep.parameters,
        responses: Object.entries(ep.responses).reduce((acc, [status, desc]) => {
          acc[status] = { description: desc };
          return acc;
        }, {} as Record<string, any>)
      };
      paths[ep.path] = pathObj;
    }

    const schemas: Record<string, any> = {};
    for (const sch of doc.schemas) {
      schemas[sch.name] = {
        type: sch.type,
        properties: sch.properties
      };
    }

    return {
      openapi: "3.0.0",
      info: {
        title: doc.title,
        version: doc.version
      },
      paths,
      components: {
        schemas
      }
    };
  }
}
