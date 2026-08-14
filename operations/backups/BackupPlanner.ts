import { BackupType } from "./BackupType.js";

/**
 * BackupPlanner outlining backup tasks templates.
 */
export class BackupPlanner {
  public createPlan(type: BackupType): string {
    return `plan-${type.toLowerCase()}`;
  }
}
