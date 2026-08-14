import { MigrationScript } from "../scripts/MigrationScript.js";
import { MigrationHistory } from "../history/MigrationHistory.js";

/**
 * Runner coordinating the execution of pending schema migrations in ascending order.
 */
export class MigrationRunner {
  constructor(private readonly scripts: MigrationScript[]) {}

  /**
   * Sorts and runs all unregistered migration scripts sequentially.
   */
  public async runPending(): Promise<void> {
    const sorted = [...this.scripts].sort((a, b) => a.version - b.version);

    for (const script of sorted) {
      if (!MigrationHistory.isApplied(script.name)) {
        await script.up();
        MigrationHistory.record(script.name, script.version);
      }
    }
  }
}
