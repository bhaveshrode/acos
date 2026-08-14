import { PlanBuilder } from "../planning/PlanBuilder.js";
import { PlanValidator } from "../planning/PlanValidator.js";
export class PlanningFactory {
    createPlanBuilder() {
        return new PlanBuilder();
    }
    createPlanValidator() {
        return new PlanValidator();
    }
}
