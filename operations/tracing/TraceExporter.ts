import { TraceContext } from "./TraceContext.js";

/**
 * TraceExporter exporting collected traces payloads.
 */
export class TraceExporter {
  public async export(spans: TraceContext[]): Promise<boolean> {
    return spans.length > 0;
  }
}
