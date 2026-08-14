import { Result } from "../../result/Result.js";

/**
 * Interface representing access authorization control evaluations (RBAC or ABAC).
 */
export interface IPermissionEvaluator {
  /**
   * Evaluates if a user is permitted to perform an operation.
   * @param userId The identity of the user.
   * @param permission The required permission key name (e.g. 'invoice:create').
   * @param context Optional parameters or variables.
   */
  hasPermission(
    userId: string,
    permission: string,
    context?: Record<string, any>
  ): Promise<Result<boolean>>;
}
