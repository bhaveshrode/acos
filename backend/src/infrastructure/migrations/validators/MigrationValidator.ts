import { MigrationScript } from "../scripts/MigrationScript.js";

/**
 * Validator checking for duplicate filenames or duplicate versions in script files.
 */
export class MigrationValidator {
  /**
   * Asserts sequence validation constraints.
   */
  public static validateSequence(scripts: MigrationScript[]): void {
    const names = new Set<string>();
    const versions = new Set<number>();

    for (const s of scripts) {
      if (names.has(s.name)) {
        throw new Error(`Duplicate migration script name detected: ${s.name}`);
      }
      if (versions.has(s.version)) {
        throw new Error(`Duplicate migration script version detected: ${s.version}`);
      }
      names.add(s.name);
      versions.add(s.version);
    }
  }
}
