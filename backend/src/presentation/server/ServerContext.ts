export interface ServerContextProps {
  startupTime: Date;
  version: string;
  environment: string;
  host: string;
  port: number;
  buildNumber: string;
  correlationId: string;
}

/**
 * ServerContext wrapper class tracking runtime configuration metadata.
 */
export class ServerContext {
  constructor(public readonly props: ServerContextProps) {}
}
