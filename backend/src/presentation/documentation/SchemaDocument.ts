/**
 * SchemaDocument representing request and response schema models.
 */
export class SchemaDocument {
  constructor(
    public readonly name: string,
    public readonly type: string,
    public readonly properties: Record<string, any> = {}
  ) {}
}
