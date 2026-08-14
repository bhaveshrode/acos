/**
 * VersionResolver interface representing a requested version extraction strategy.
 */
export interface VersionResolver {
  resolve(req: any): string | undefined;
}
