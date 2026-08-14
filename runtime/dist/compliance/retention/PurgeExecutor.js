/**
 * PurgeExecutor executing purging actions on expired resources.
 */
export class PurgeExecutor {
    manager;
    constructor(manager) {
        this.manager = manager;
    }
    executePurge(resource, databaseMock) {
        const purgedIds = [];
        // Filter elements in place
        for (let i = databaseMock.length - 1; i >= 0; i--) {
            const record = databaseMock[i];
            const decision = this.manager.evaluate(resource, record.createdAt);
            if (decision.shouldPurge) {
                purgedIds.push(record.id);
                databaseMock.splice(i, 1);
            }
        }
        return purgedIds;
    }
}
