/**
 * AuthenticationException indicating authorization / validation token failures.
 */
export class AuthenticationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationException";
  }
}
