import { BackupPlanner } from "./BackupPlanner.js";
import { BackupExecutor } from "./BackupExecutor.js";
import { RestoreExecutor } from "./RestoreExecutor.js";

/**
 * BackupsFactory building planners and executors.
 */
export class BackupsFactory {
  public static createPlanner(): BackupPlanner {
    return new BackupPlanner();
  }

  public static createBackupExecutor(): BackupExecutor {
    return new BackupExecutor();
  }

  public static createRestoreExecutor(): RestoreExecutor {
    return new RestoreExecutor();
  }

  public createPlanner(): BackupPlanner {
    return BackupsFactory.createPlanner();
  }

  public createBackupExecutor(): BackupExecutor {
    return BackupsFactory.createBackupExecutor();
  }

  public createRestoreExecutor(): RestoreExecutor {
    return BackupsFactory.createRestoreExecutor();
  }
}
