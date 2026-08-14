/**
 * Contract representing Execution context metadata, such as User and Org references.
 */
export interface IExecutionContext {
  readonly userId: string | null;
  readonly organizationId: string | null;
  readonly correlationId: string;
  readonly timestamp: Date;
}
