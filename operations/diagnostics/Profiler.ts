import { DiagnosticReport } from "./DiagnosticReport.js";

/**
 * Profiler tracking simulated heap issues.
 */
export class Profiler {
  public analyzeMemory(heapBytes: number): DiagnosticReport {
    const issues: string[] = [];
    if (heapBytes > 1024 * 1024 * 1024) {
      issues.push("High memory utilization: potential memory leak");
    }
    return new DiagnosticReport(issues.length > 0, issues);
  }
}
