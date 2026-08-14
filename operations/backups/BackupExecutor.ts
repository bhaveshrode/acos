import { BackupType } from "./BackupType.js";

/**
 * BackupExecutor executing backup tasks.
 */
export class BackupExecutor {
  public async runBackup(type: BackupType, plan: string): Promise<string> {
    return `backup-${type.toLowerCase()}-${plan}-${Date.now()}.tar.gz`;
  }
}
