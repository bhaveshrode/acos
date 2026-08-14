export interface AuthenticationContextProps {
  user?: { id: string; role: string; permissions: string[] };
  organizationId?: string;
  token?: string;
  isAuthenticated: boolean;
}

/**
 * AuthenticationContext tracking dynamic claims and validated tokens statuses.
 */
export class AuthenticationContext {
  constructor(public readonly props: AuthenticationContextProps) {}
}
