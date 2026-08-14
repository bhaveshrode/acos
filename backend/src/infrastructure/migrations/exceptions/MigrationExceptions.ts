/**
 * Base migration exception.
 */
export class MigrationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MigrationException";
  }
}

/**
 * Thrown when undoing applied scripts fails.
 */
export class RollbackException extends MigrationException {
  constructor(migrationName: string, details: string) {
    super(`Failed to rollback migration '${migrationName}': ${details}`);
    this.name = "RollbackException";
  }
}

/**
 * Thrown when script constraints or checksum validation fails.
 */
export class MigrationValidationException extends MigrationException {
  constructor(details: string) {
    super(`Migration validation failed: ${details}`);
    this.name = "MigrationValidationException";
  }
}
