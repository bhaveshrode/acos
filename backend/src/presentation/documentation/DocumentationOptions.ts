/**
 * DocumentationOptions defines general options for docs generation pipelines.
 */
export class DocumentationOptions {
  constructor(
    public readonly title: string = "ACOS API Docs",
    public readonly version: string = "1.0.0",
    public readonly enableOpenApi: boolean = true
  ) {}
}
