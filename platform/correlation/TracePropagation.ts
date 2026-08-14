import { CorrelationContext } from "./CorrelationContext.js";

export class TracePropagation {
  private currentContext: CorrelationContext | null = null;

  public setContext(context: CorrelationContext): void {
    this.currentContext = context;
  }

  public getContext(): CorrelationContext | null {
    return this.currentContext;
  }

  public clear(): void {
    this.currentContext = null;
  }

  public propagate(nextEventId: string): CorrelationContext {
    if (!this.currentContext) {
      return CorrelationContext.create(nextEventId);
    }
    return this.currentContext.deriveNext(nextEventId);
  }
}
