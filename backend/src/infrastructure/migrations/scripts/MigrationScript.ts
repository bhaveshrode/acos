/**
 * Interface contract representing a database schema migration script.
 */
export interface MigrationScript {
  name: string;
  version: number;
  up(): Promise<void>;
  down(): Promise<void>;
}
