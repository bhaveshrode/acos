/**
 * AuthorizationOptions specifying default policies and fallback mechanisms.
 */
export interface AuthorizationOptions {
  defaultPolicy?: string;
  fallbackBehavior?: "allow" | "deny";
  bypassValidation?: boolean;
}
