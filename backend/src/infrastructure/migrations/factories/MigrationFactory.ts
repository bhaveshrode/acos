import { MigrationRunner } from "../runners/MigrationRunner.js";
import { RollbackRunner } from "../runners/RollbackRunner.js";
import { InitialSchemaMigration } from "../scripts/001_initial_schema.js";
import { AddIndexesMigration } from "../scripts/002_add_indexes.js";
import { ConfigurationSnapshot } from "../../../foundation/config/ConfigurationSnapshot.js";

/**
 * Factory class generating concrete migration runners and rollback managers.
 */
export class MigrationFactory {
  /**
   * Builds a MigrationRunner preconfigured with all default schema scripts.
   */
  public static createMigrationRunner(config?: ConfigurationSnapshot): MigrationRunner {
    const scripts = [new InitialSchemaMigration(), new AddIndexesMigration()];
    return new MigrationRunner(scripts);
  }

  /**
   * Builds a RollbackRunner preconfigured with all default schema scripts.
   */
  public static createRollbackRunner(config?: ConfigurationSnapshot): RollbackRunner {
    const scripts = [new InitialSchemaMigration(), new AddIndexesMigration()];
    return new RollbackRunner(scripts);
  }
}
