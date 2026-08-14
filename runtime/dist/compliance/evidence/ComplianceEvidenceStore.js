/**
 * ComplianceEvidenceStore archiving proof trace models.
 */
export class ComplianceEvidenceStore {
    items = [];
    save(evidence) {
        this.items.push(evidence);
    }
    getAll() {
        return Object.freeze([...this.items]);
    }
    clear() {
        this.items.length = 0;
    }
}
