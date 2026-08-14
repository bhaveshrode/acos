import { DatabaseRuntime } from "./DatabaseRuntime.js";

/**
 * DatabaseBackupAdapter serializing state backups.
 */
export class DatabaseBackupAdapter {
  private backupData?: string;

  public backup(db: DatabaseRuntime): string {
    const records = Array.from(db.getMockStore().entries());
    this.backupData = JSON.stringify(records);
    return this.backupData;
  }

  public restore(db: DatabaseRuntime, backupPayload: string): void {
    const parsed = JSON.parse(backupPayload) as Array<[string, any]>;
    const store = db.getMockStore();
    store.clear();
    for (const [k, v] of parsed) {
      store.set(k, v);
    }
  }

  public getSavedBackup(): string | undefined {
    return this.backupData;
  }
}
