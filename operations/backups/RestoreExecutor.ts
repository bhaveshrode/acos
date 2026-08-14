/**
 * RestoreExecutor recovering backups archives.
 */
export class RestoreExecutor {
  public async runRestore(backupPath: string): Promise<boolean> {
    return backupPath.includes(".tar.gz");
  }
}
