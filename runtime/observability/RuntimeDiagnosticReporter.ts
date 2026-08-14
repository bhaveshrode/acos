import { RuntimeTelemetry } from "./RuntimeTelemetry.js";
import { RuntimeMetrics } from "./RuntimeMetrics.js";

/**
 * RuntimeDiagnosticReporter summarizing telemetry and metrics.
 */
export class RuntimeDiagnosticReporter {
  constructor(
    private readonly telemetry: RuntimeTelemetry,
    private readonly metrics: RuntimeMetrics
  ) {}

  public buildReport(subsystemList: string[]): string {
    const report: string[] = ["ACOS RUNTIME DIAGNOSTIC REPORT"];
    report.push("==============================");
    report.push(`Total Transactions Processed: ${this.metrics.get("transactions")}`);

    for (const sub of subsystemList) {
      const dur = this.telemetry.getDurationMs(sub);
      report.push(`- Subsystem ${sub}: ${dur}ms`);
    }

    return report.join("\n");
  }
}
