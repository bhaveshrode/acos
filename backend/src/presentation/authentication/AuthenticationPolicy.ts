export interface AuthenticationPolicyProps {
  tokenLifetimeMinutes: number;
  refreshTokenLifetimeDays: number;
  requireStrongPassword: boolean;
}

/**
 * AuthenticationPolicy detailing policy options.
 */
export class AuthenticationPolicy {
  constructor(public readonly props: AuthenticationPolicyProps) {}
}
