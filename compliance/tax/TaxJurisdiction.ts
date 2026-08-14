/**
 * TaxJurisdiction representing a local tax authority region.
 */
export class TaxJurisdiction {
  constructor(
    public readonly code: string,
    public readonly name: string,
    public readonly defaultRate: number
  ) {
    Object.freeze(this);
  }
}
