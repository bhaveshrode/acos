export interface ExceptionContextProps {
  correlationId: string;
  requestId?: string;
  path?: string;
  method?: string;
  timestamp: Date;
}

/**
 * ExceptionContext carrying execution details and correlation keys.
 */
export class ExceptionContext {
  constructor(public readonly props: ExceptionContextProps) {}
}
