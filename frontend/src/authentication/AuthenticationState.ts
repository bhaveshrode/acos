/**
 * AuthenticationState enum capturing security lifecycle states.
 */
export enum AuthenticationState {
  Unauthenticated = "Unauthenticated",
  Authenticating = "Authenticating",
  Authenticated = "Authenticated",
  Refreshing = "Refreshing",
  Expired = "Expired"
}
