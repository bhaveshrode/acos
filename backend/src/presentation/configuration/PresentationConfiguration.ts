/**
 * PresentationConfiguration containing HTTP server, routing, middleware, security, and serialization settings.
 */
export interface PresentationConfiguration {
  server: {
    port: number;
    host: string;
    bodyLimit: string;
  };
  routing: {
    prefix: string;
    enableVersionRouting: boolean;
  };
  middleware: {
    enableCors: boolean;
    enableCompression: boolean;
    rateLimitMax: number;
  };
  security: {
    jwtSecret: string;
    tokenLifetimeSeconds: number;
  };
  serialization: {
    prettyPrint: boolean;
  };
}
