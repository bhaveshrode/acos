import { PlanBuilder } from "../planning/PlanBuilder.js";
import { PlanValidator } from "../planning/PlanValidator.js";

export class PlanningFactory {
  public createPlanBuilder(): PlanBuilder {
    return new PlanBuilder();
  }

  public createPlanValidator(): PlanValidator {
    return new PlanValidator();
  }
}
