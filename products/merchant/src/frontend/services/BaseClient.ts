export interface IClientContext {
  getHeaders(): Record<string, string>;
  getSessionToken(): string | null;
  setSessionToken(token: string | null): void;
  readonly backend: any;
  readonly logger: any;
}

export abstract class BaseClient {
  constructor(protected readonly ctx: IClientContext) {}
}
