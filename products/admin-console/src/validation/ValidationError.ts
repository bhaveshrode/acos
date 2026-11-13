/**
 * ValidationError recording individual rules failures details.
 */
export class ValidationError {
  constructor(
    public readonly property: string,
    public readonly message: string,
    public readonly ruleName: string
  ) {
    Object.freeze(this);
  }
}
