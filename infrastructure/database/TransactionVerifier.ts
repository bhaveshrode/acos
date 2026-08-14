import { DatabaseRuntime } from "./DatabaseRuntime.js";

/**
 * TransactionVerifier validating transactional rollbacks and commits.
 */
export class TransactionVerifier {
  public async executeTransaction<T>(
    db: DatabaseRuntime,
    actions: (db: DatabaseRuntime) => Promise<T>
  ): Promise<T> {
    const backup = new Map(db.getMockStore());

    try {
      const result = await actions(db);
      return result;
    } catch (err: any) {
      // Rollback database state back to prior backup
      const store = db.getMockStore();
      store.clear();
      for (const [k, v] of backup.entries()) {
        store.set(k, v);
      }
      throw err;
    }
  }
}
