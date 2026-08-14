/**
 * EventRecoveryManager managing recoveries of dead letter queue logs.
 */
export class EventRecoveryManager {
    bus;
    constructor(bus) {
        this.bus = bus;
    }
    async retryDeadLetters() {
        const deadLetters = this.bus.getDeadLetters();
        let retriedCount = 0;
        for (const dl of deadLetters) {
            const success = await this.bus.publish(dl.topic, dl.payload);
            if (success) {
                retriedCount++;
            }
        }
        return retriedCount;
    }
}
