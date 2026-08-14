/**
 * RuntimeDiagnosticReporter summarizing telemetry and metrics.
 */
export class RuntimeDiagnosticReporter {
    telemetry;
    metrics;
    constructor(telemetry, metrics) {
        this.telemetry = telemetry;
        this.metrics = metrics;
    }
    buildReport(subsystemList) {
        const report = ["ACOS RUNTIME DIAGNOSTIC REPORT"];
        report.push("==============================");
        report.push(`Total Transactions Processed: ${this.metrics.get("transactions")}`);
        for (const sub of subsystemList) {
            const dur = this.telemetry.getDurationMs(sub);
            report.push(`- Subsystem ${sub}: ${dur}ms`);
        }
        return report.join("\n");
    }
}
