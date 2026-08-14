/**
 * RuntimeTelemetry gathering system latencies.
 */
export class RuntimeTelemetry {
    startTimes = new Map();
    endTimes = new Map();
    startTrace(name) {
        this.startTimes.set(name.toLowerCase(), Date.now());
    }
    endTrace(name) {
        this.endTimes.set(name.toLowerCase(), Date.now());
    }
    getDurationMs(name) {
        const key = name.toLowerCase();
        const start = this.startTimes.get(key) ?? 0;
        const end = this.endTimes.get(key) ?? 0;
        return Math.max(0, end - start);
    }
    clear() {
        this.startTimes.clear();
        this.endTimes.clear();
    }
}
