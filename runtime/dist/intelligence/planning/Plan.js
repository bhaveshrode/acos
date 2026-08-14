export class Plan {
    planId;
    decisionId;
    steps;
    createdAt;
    constructor(planId, decisionId, steps, createdAt) {
        this.planId = planId;
        this.decisionId = decisionId;
        this.steps = steps;
        this.createdAt = createdAt;
        Object.freeze(this);
    }
}
