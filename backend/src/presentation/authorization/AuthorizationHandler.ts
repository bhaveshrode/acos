import { AuthorizationRequirement, RoleRequirement, PermissionRequirement, OwnerRequirement } from "./AuthorizationRequirement.js";
import { AuthorizationContext } from "./AuthorizationContext.js";

/**
 * AuthorizationHandler contract evaluating specific requirements.
 */
export interface AuthorizationHandler {
  canHandle(requirement: AuthorizationRequirement): boolean;
  handle(requirement: AuthorizationRequirement, context: AuthorizationContext): Promise<boolean>;
}

/**
 * RoleAuthorizationHandler evaluating RoleRequirement parameters.
 */
export class RoleAuthorizationHandler implements AuthorizationHandler {
  public canHandle(requirement: AuthorizationRequirement): boolean {
    return requirement instanceof RoleRequirement;
  }

  public async handle(requirement: AuthorizationRequirement, context: AuthorizationContext): Promise<boolean> {
    const roleReq = requirement as RoleRequirement;
    return context.props.roles.includes(roleReq.requiredRole);
  }
}

/**
 * PermissionAuthorizationHandler evaluating PermissionRequirement parameters.
 */
export class PermissionAuthorizationHandler implements AuthorizationHandler {
  public canHandle(requirement: AuthorizationRequirement): boolean {
    return requirement instanceof PermissionRequirement;
  }

  public async handle(requirement: AuthorizationRequirement, context: AuthorizationContext): Promise<boolean> {
    const permReq = requirement as PermissionRequirement;
    return context.props.permissions.includes(permReq.requiredPermission);
  }
}

/**
 * OwnerAuthorizationHandler evaluating resource ownership.
 */
export class OwnerAuthorizationHandler implements AuthorizationHandler {
  public canHandle(requirement: AuthorizationRequirement): boolean {
    return requirement instanceof OwnerRequirement;
  }

  public async handle(requirement: AuthorizationRequirement, context: AuthorizationContext): Promise<boolean> {
    if (!context.props.resourceId) return false;
    return context.props.resourceId.startsWith(context.props.userId);
  }
}
