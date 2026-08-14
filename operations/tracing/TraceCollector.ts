import { TraceContext } from "./TraceContext.js";

/**
 * TraceCollector logging active trace spans contexts.
 */
export class TraceCollector {
  private readonly activeSpans = new Map<string, TraceContext>();

  public recordSpan(context: TraceContext): void {
    this.activeSpans.set(context.spanId, context);
  }

  public getSpan(spanId: string): TraceContext | undefined {
    return this.activeSpans.get(spanId);
  }

  public getSpans(): TraceContext[] {
    return Array.from(this.activeSpans.values());
  }
}
