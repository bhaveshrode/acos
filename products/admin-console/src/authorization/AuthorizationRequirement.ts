/**
 * RequirementType classifying role-, permission-, claim-, and ownership-based rules constraints.
 */
export type RequirementType = "role" | "permission" | "claim" | "ownership";

/**
 * AuthorizationRequirement capturing requirement type and value properties.
 */
export class AuthorizationRequirement {
  constructor(
    public readonly type: RequirementType,
    public readonly value: any
  ) {
    Object.freeze(this);
  }
}
