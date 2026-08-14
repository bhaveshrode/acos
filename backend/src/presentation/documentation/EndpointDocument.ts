/**
 * EndpointDocument representing endpoint specifications.
 */
export class EndpointDocument {
  constructor(
    public readonly method: string,
    public readonly path: string,
    public readonly summary: string,
    public readonly parameters: any[] = [],
    public readonly requestBodySchemaName?: string,
    public readonly responses: Record<string, string> = {}
  ) {}
}
