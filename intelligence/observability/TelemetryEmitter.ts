export interface TelemetryMetric {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: Date;
}

export class TelemetryEmitter {
  private readonly metrics: TelemetryMetric[] = [];

  public trackDecisionLatency(agentId: string, ms: number): void {
    this.recordMetric("intelligence.decision.latency", ms, { agentId });
  }

  public trackModelRequest(model: string, tokens: number): void {
    this.recordMetric("intelligence.model.tokens", tokens, { model });
  }

  public trackSuccessRate(actionName: string, success: boolean): void {
    this.recordMetric("intelligence.action.success", success ? 1 : 0, { actionName });
  }

  public recordMetric(name: string, value: number, tags: Record<string, string> = {}): void {
    this.metrics.push({
      name,
      value,
      tags,
      timestamp: new Date()
    });
  }

  public getMetrics(): TelemetryMetric[] {
    return this.metrics;
  }

  public clear(): void {
    this.metrics.length = 0;
  }
}
