/**
 * SecretKey wrapping vault item IDs and values.
 */
export class SecretKey {
  constructor(
    public readonly id: string,
    public readonly value: string,
    public readonly version: string = "1"
  ) {
    Object.freeze(this);
  }
}
