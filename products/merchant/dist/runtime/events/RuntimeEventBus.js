/**
 * RuntimeEventBus implementing system-level pub/sub events broker.
 */
export class RuntimeEventBus {
    subscribers = new Map();
    deadLetterQueue = [];
    subscribe(topic, callback) {
        const key = topic.toLowerCase();
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(callback);
        return () => {
            const list = this.subscribers.get(key) ?? [];
            const idx = list.indexOf(callback);
            if (idx !== -1) {
                list.splice(idx, 1);
            }
        };
    }
    async publish(topic, payload) {
        const key = topic.toLowerCase();
        const list = this.subscribers.get(key) ?? [];
        let allOk = true;
        for (const callback of list) {
            try {
                await callback(payload);
            }
            catch (err) {
                allOk = false;
                this.deadLetterQueue.push({ topic, payload, error: err.message });
            }
        }
        return allOk;
    }
    getDeadLetters() {
        return Object.freeze([...this.deadLetterQueue]);
    }
    clear() {
        this.subscribers.clear();
        this.deadLetterQueue.length = 0;
    }
}
