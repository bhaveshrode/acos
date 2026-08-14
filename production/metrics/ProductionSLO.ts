/**
 * ProductionSLO tracking target SLA thresholds.
 */
export class ProductionSLO {
  constructor(
    public readonly name: string,
    public readonly targetPercentage: number
  ) {
    Object.freeze(this);
  }
}
