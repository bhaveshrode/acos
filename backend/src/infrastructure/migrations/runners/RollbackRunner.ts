import { MigrationScript } from "../scripts/MigrationScript.js";
import { MigrationHistory } from "../history/MigrationHistory.js";

/**
 * Runner coordinating the rollback reversion of database migrations.
 */
export class RollbackRunner {
  constructor(private readonly scripts: MigrationScript[]) {}

  /**
   * Reverts the single last executed migration.
   */
  public async rollbackLast(): Promise<void> {
    const applied = MigrationHistory.getApplied();
    if (applied.length === 0) return;

    const lastAppliedRecord = applied[applied.length - 1];
    const match = this.scripts.find((s) => s.name === lastAppliedRecord.name);

    if (match) {
      await match.down();
      MigrationHistory.remove(match.name);
    }
  }

  /**
   * Reverts all applied migrations in reverse chronological order.
   */
  public async rollbackAll(): Promise<void> {
    const applied = [...MigrationHistory.getApplied()].reverse();

    for (const record of applied) {
      const match = this.scripts.find((s) => s.name === record.name);
      if (match) {
        await match.down();
        MigrationHistory.remove(match.name);
      }
    }
  }
}
