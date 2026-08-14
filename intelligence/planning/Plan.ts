export type StepStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export interface PlanStep {
  stepId: string;
  description: string;
  toolName: string;
  payload: any;
  status: StepStatus;
  idempotencyKey: string;
  error?: string;
  result?: any;
}

export class Plan {
  constructor(
    public readonly planId: string,
    public readonly decisionId: string,
    public readonly steps: PlanStep[],
    public readonly createdAt: Date
  ) {
    Object.freeze(this);
  }
}
