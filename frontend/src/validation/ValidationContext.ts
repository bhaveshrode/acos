/**
 * ValidationContext carrying target object references alongside computed validation details.
 */
export class ValidationContext {
  constructor(
    public readonly target: any,
    public readonly errors: Readonly<Record<string, string>> = {},
    public readonly warnings: Readonly<Record<string, string>> = {},
    public readonly metadata: Readonly<Record<string, any>> = {},
    public readonly scope: string = "default"
  ) {
    Object.freeze(this.errors);
    Object.freeze(this.warnings);
    Object.freeze(this.metadata);
    Object.freeze(this);
  }
}
