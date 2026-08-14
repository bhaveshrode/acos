/**
 * TaxRule declaring calculation rate algorithms.
 */
export class TaxRule {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly rate: number
  ) {
    Object.freeze(this);
  }
}
