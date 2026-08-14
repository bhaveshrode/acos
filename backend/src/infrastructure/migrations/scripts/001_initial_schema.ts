import { MigrationScript } from "./MigrationScript.js";

/**
 * Migration creating base relational database tables.
 */
export class InitialSchemaMigration implements MigrationScript {
  public readonly name = "001_initial_schema";
  public readonly version = 1;

  public async up(): Promise<void> {
    // Simulates physical table creation logic
  }

  public async down(): Promise<void> {
    // Simulates dropping tables logic
  }
}
