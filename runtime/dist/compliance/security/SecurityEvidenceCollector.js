/**
 * SecurityEvidenceCollector archiving security logs.
 */
export class SecurityEvidenceCollector {
    records = [];
    collect(record) {
        this.records.push(record);
    }
    getCollected() {
        return Object.freeze([...this.records]);
    }
    clear() {
        this.records.length = 0;
    }
}
