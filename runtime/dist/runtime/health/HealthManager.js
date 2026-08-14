import { HealthCheck } from "./HealthCheck.js";
import { HealthReport } from "./HealthReport.js";
/**
 * HealthManager collecting subsystem health details.
 */
export class HealthManager {
    customChecks = new Map();
    registerCheck(name, checkFn) {
        this.customChecks.set(name.toLowerCase(), checkFn);
    }
    async evaluate() {
        const checks = [];
        for (const [name, checkFn] of this.customChecks.entries()) {
            try {
                const res = await checkFn();
                checks.push(res);
            }
            catch (err) {
                checks.push(new HealthCheck(name, false, err.message));
            }
        }
        const overallHealthy = checks.every((c) => c.isHealthy);
        return new HealthReport(overallHealthy, checks);
    }
}
