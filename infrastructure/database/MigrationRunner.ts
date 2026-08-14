import { MigrationValidator } from "./MigrationValidator.js";

/**
 * MigrationRunner applying database schema versions.
 */
export class MigrationRunner {
  private readonly validator = new MigrationValidator();
  private currentVersion = 0;

  public async runMigration(version: number, sql: string): Promise<boolean> {
    const check = this.validator.validateSQL(sql);
    if (!check.isSafe) {
      throw new Error(`Migration rejected: ${check.reason}`);
    }

    this.currentVersion = version;
    return true;
  }

  public getCurrentVersion(): number {
    return this.currentVersion;
  }
}
