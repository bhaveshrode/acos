/**
 * Encapsulates the active database query client or transaction boundary.
 */
export class RepositoryContext {
    client;
    constructor(client) {
        this.client = client;
    }
    /**
     * Executes a database transaction block, passing a transactional RepositoryContext.
     */
    async transaction(runInTx) {
        if ("$transaction" in this.client) {
            return this.client.$transaction(async (txClient) => {
                return runInTx(new RepositoryContext(txClient));
            });
        }
        // Already executing in a transactional boundary, execute inline.
        return runInTx(this);
    }
}
