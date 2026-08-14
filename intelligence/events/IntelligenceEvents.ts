export interface IIntelligenceEvent {
  readonly eventId: string;
  readonly correlationId: string;
  readonly causationId: string;
  readonly type: string;
  readonly timestamp: Date;
  readonly payload: any;
}

export class IntelligenceDecisionCreated implements IIntelligenceEvent {
  public readonly eventId = `evt_dec_${Math.floor(Math.random() * 100000)}`;
  public readonly type = "intelligence.decision.created";
  public readonly timestamp = new Date();
  constructor(
    public readonly payload: any,
    public readonly correlationId: string,
    public readonly causationId: string
  ) {}
}

export class PlanCreated implements IIntelligenceEvent {
  public readonly eventId = `evt_plan_${Math.floor(Math.random() * 100000)}`;
  public readonly type = "intelligence.plan.created";
  public readonly timestamp = new Date();
  constructor(
    public readonly payload: any,
    public readonly correlationId: string,
    public readonly causationId: string
  ) {}
}

export class PlanApproved implements IIntelligenceEvent {
  public readonly eventId = `evt_app_${Math.floor(Math.random() * 100000)}`;
  public readonly type = "intelligence.plan.approved";
  public readonly timestamp = new Date();
  constructor(
    public readonly payload: any,
    public readonly correlationId: string,
    public readonly causationId: string
  ) {}
}

export class ActionCompleted implements IIntelligenceEvent {
  public readonly eventId = `evt_comp_${Math.floor(Math.random() * 100000)}`;
  public readonly type = "intelligence.action.completed";
  public readonly timestamp = new Date();
  constructor(
    public readonly payload: any,
    public readonly correlationId: string,
    public readonly causationId: string
  ) {}
}

export class ActionFailed implements IIntelligenceEvent {
  public readonly eventId = `evt_fail_${Math.floor(Math.random() * 100000)}`;
  public readonly type = "intelligence.action.failed";
  public readonly timestamp = new Date();
  constructor(
    public readonly payload: any,
    public readonly correlationId: string,
    public readonly causationId: string
  ) {}
}
