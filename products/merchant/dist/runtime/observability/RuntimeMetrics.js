/**
 * RuntimeMetrics storing counts.
 */
export class RuntimeMetrics {
    counters = new Map();
    increment(counter) {
        const key = counter.toLowerCase();
        const cur = this.counters.get(key) ?? 0;
        this.counters.set(key, cur + 1);
    }
    get(counter) {
        return this.counters.get(counter.toLowerCase()) ?? 0;
    }
    clear() {
        this.counters.clear();
    }
}
