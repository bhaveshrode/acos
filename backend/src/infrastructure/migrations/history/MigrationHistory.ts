export interface MigrationRecord {
  id: string;
  name: string;
  version: number;
  appliedAt: Date;
}

/**
 * MigrationHistory ledger class managing execution tracking states.
 */
export class MigrationHistory {
  private static records: MigrationRecord[] = [];

  /**
   * Retrieves all applied migration records.
   */
  public static getApplied(): MigrationRecord[] {
    return this.records;
  }

  /**
   * Confirms if a migration script has already been applied.
   */
  public static isApplied(name: string): boolean {
    return this.records.some((r) => r.name === name);
  }

  /**
   * Records execution of a migration script.
   */
  public static record(name: string, version: number): void {
    this.records.push({
      id: Math.random().toString(36).substring(2, 9),
      name,
      version,
      appliedAt: new Date()
    });
  }

  /**
   * Deletes a recorded schema migration (e.g. on rollback actions).
   */
  public static remove(name: string): void {
    this.records = this.records.filter((r) => r.name !== name);
  }

  /**
   * Resets schema execution ledger records.
   */
  public static clear(): void {
    this.records = [];
  }
}
