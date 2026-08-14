/**
 * ValidationDecision capturing execution diagnostics and failed rules collections.
 */
export class ValidationDecision {
  constructor(
    public readonly isValid: boolean,
    public readonly failedRules: ReadonlyArray<string> = [],
    public readonly metadata: Readonly<Record<string, any>> = {}
  ) {
    Object.freeze(this.failedRules);
    Object.freeze(this.metadata);
    Object.freeze(this);
  }
}
