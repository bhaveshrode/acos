export interface ResponseContextProps {
  statusCode: number;
  headers: Record<string, string>;
  correlationId: string;
  executionTimeMs?: number;
}

/**
 * ResponseContext carrying status codes, headers, and trace identifiers.
 */
export class ResponseContext {
  constructor(public readonly props: ResponseContextProps) {}
}
