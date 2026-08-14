export interface RequestMetadataProps {
  correlationId: string;
  requestId: string;
  clientIp?: string;
  userAgent?: string;
  timestamp: Date;
  executionStartTimeMs: number;
}

/**
 * RequestMetadata carrying tracking identifiers.
 */
export class RequestMetadata {
  constructor(public readonly props: RequestMetadataProps) {}
}
