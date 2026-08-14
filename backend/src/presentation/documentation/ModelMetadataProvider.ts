/**
 * ModelMetadataProvider extracts properties from DTO model descriptors.
 */
export class ModelMetadataProvider {
  public getModelProperties(modelName: string): Record<string, any> {
    return {
      id: { type: "string", format: "uuid" },
      createdAt: { type: "string", format: "date-time" }
    };
  }
}
