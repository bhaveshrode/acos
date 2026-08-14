/**
 * AuthorizeAttribute class holding access control requirements policies tags.
 */
export class AuthorizeAttribute {
  constructor(public readonly policyName: string) {}
}
