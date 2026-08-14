/**
 * LegalHoldManager registering and checking legal holds.
 */
export class LegalHoldManager {
    activeHolds = new Set();
    addHold(userId) {
        this.activeHolds.add(userId);
    }
    removeHold(userId) {
        this.activeHolds.delete(userId);
    }
    hasHold(userId) {
        return this.activeHolds.has(userId);
    }
    clear() {
        this.activeHolds.clear();
    }
}
