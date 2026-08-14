/**
 * DeploymentOptions defining rollback policies and timeouts.
 */
export interface DeploymentOptions {
  dryRun?: boolean;
  rollbackOnFailure?: boolean;
  timeoutMs?: number;
}
