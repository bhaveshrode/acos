/**
 * Interface representing an individual authorization condition condition.
 */
export interface AuthorizationRequirement {
  name: string;
}

/**
 * Concrete requirement validating specific user role values.
 */
export class RoleRequirement implements AuthorizationRequirement {
  public readonly name = "RoleRequirement";
  constructor(public readonly requiredRole: string) {}
}

/**
 * Concrete requirement validating specific action permission values.
 */
export class PermissionRequirement implements AuthorizationRequirement {
  public readonly name = "PermissionRequirement";
  constructor(public readonly requiredPermission: string) {}
}

/**
 * Concrete requirement validating owner resource relationship metrics.
 */
export class OwnerRequirement implements AuthorizationRequirement {
  public readonly name = "OwnerRequirement";
}
