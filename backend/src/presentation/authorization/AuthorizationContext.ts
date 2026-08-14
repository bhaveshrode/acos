export interface AuthorizationContextProps {
  userId: string;
  roles: string[];
  permissions: string[];
  resourceId?: string;
  metadata?: Record<string, any>;
}

/**
 * AuthorizationContext storing active user role permission parameters and target resource IDs.
 */
export class AuthorizationContext {
  constructor(public readonly props: AuthorizationContextProps) {}
}
