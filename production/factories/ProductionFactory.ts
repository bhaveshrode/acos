import { ProductionComposition } from "./ProductionComposition.js";

/**
 * ProductionFactory acting as the centralized composition Gateway root.
 */
export class ProductionFactory {
  constructor(
    public readonly composition = new ProductionComposition()
  ) {
    Object.freeze(this);
  }

  public get environment() { return this.composition.environment; }
  public get rollback() { return this.composition.rollback; }
  public get release() { return this.composition.release; }
  public get smoke() { return this.composition.smoke; }
  public get pilot() { return this.composition.pilot; }
  public get journeys() { return this.composition.journeys; }
  public get incidents() { return this.composition.incidents; }
  public get metrics() { return this.composition.metrics; }
  public get feedback() { return this.composition.feedback; }
  public get rollout() { return this.composition.rollout; }
  public get support() { return this.composition.support; }
  public get certifier() { return this.composition.certifier; }
}
