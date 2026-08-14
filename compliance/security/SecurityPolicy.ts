/**
 * SecurityPolicy capturing basic guidelines.
 */
export class SecurityPolicy {
  constructor(
    public readonly allowLocalhost: boolean = false,
    public readonly strictCorrelationRequired: boolean = true
  ) {
    Object.freeze(this);
  }
}
