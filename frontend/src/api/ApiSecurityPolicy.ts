/**
 * ApiSecurityPolicy defining credentials forwarding policies.
 */
export interface ApiSecurityPolicy {
  forwardCredentials?: boolean;
  authHeaderScheme?: string;
}
