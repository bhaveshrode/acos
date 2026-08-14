export interface SecurityClaims {
  userId: string;
  organizationId: string;
  permissions: string[];
  tokenExpiresAt: Date;
  isRevoked: boolean;
}

export class SecurityHardener {
  public validateSession(claims: SecurityClaims): void {
    if (claims.isRevoked) {
      throw new Error("Security check failed: Session is revoked.");
    }
    if (claims.tokenExpiresAt.getTime() < Date.now()) {
      throw new Error("Security check failed: Token has expired.");
    }
  }

  public checkToolPermission(claims: SecurityClaims, requiredPermission: string): void {
    this.validateSession(claims);
    
    // Verify permission matches agent authorization boundary
    if (!claims.permissions.includes(requiredPermission)) {
      throw new Error(`Security authorization failed: Insufficient permissions for action. Missing: ${requiredPermission}`);
    }
  }

  public auditAgentAction(agentId: string, toolId: string, claims: SecurityClaims): void {
    this.validateSession(claims);
    
    // Safety check: agents inherit the same security controls as the caller
    const isCritical = toolId.includes("refund") || toolId.includes("delete");
    if (isCritical && !claims.permissions.includes("admin.execute")) {
      throw new Error(`Security breach detected: Agent '${agentId}' attempted high-risk action '${toolId}' without admin privileges.`);
    }
  }
}
