/**
 * AuditStore managing in-memory storage of audit records.
 */
export class AuditStore {
    records = [];
    save(record) {
        this.records.push(record);
    }
    getAll() {
        return Object.freeze([...this.records]);
    }
    clear() {
        this.records.length = 0;
    }
}
