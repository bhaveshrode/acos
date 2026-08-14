import { AsyncLocalStorage } from "async_hooks";
/**
 * Ambient Storage holding the active database transaction context.
 * Decouples repositories from manually passing transaction clients down the call stack.
 */
export class TransactionScope {
    static storage = new AsyncLocalStorage();
    /**
     * Runs a callback within the context of an active transaction.
     * @param client The active Prisma transaction client.
     * @param callback The callback containing transactional repository actions.
     */
    static run(client, callback) {
        return this.storage.run(client, callback);
    }
    /**
     * Enters the transactional client context into the current asynchronous execution flow.
     * @param client The active Prisma transaction client.
     */
    static enter(client) {
        this.storage.enterWith(client);
    }
    /**
     * Retrieves the active transaction client if inside a transaction scope.
     */
    static get current() {
        return this.storage.getStore();
    }
}
