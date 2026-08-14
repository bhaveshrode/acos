import { TraceContext } from "./TraceContext.js";
import { TraceCollector } from "./TraceCollector.js";
import { TraceExporter } from "./TraceExporter.js";

/**
 * TracingFactory building collectors and exporters.
 */
export class TracingFactory {
  public static createContext(
    traceId: string,
    spanId: string,
    parentSpanId?: string
  ): TraceContext {
    return new TraceContext(traceId, spanId, parentSpanId);
  }

  public static createCollector(): TraceCollector {
    return new TraceCollector();
  }

  public static createExporter(): TraceExporter {
    return new TraceExporter();
  }

  public createContext(
    traceId: string,
    spanId: string,
    parentSpanId?: string
  ): TraceContext {
    return TracingFactory.createContext(traceId, spanId, parentSpanId);
  }

  public createCollector(): TraceCollector {
    return TracingFactory.createCollector();
  }

  public createExporter(): TraceExporter {
    return TracingFactory.createExporter();
  }
}
