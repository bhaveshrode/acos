/**
 * MigrationValidator checking SQL script compatibility.
 */
export class MigrationValidator {
  public validateSQL(sql: string): { isSafe: boolean; reason?: string } {
    const normalized = sql.toLowerCase();

    // Block table dropping or unsafe column deletions in production migrations
    if (normalized.includes("drop table") || normalized.includes("drop column")) {
      return {
        isSafe: false,
        reason: "Destructive migrations containing DROP instructions are prohibited"
      };
    }

    return { isSafe: true };
  }
}
