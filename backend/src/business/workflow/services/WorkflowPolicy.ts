import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { Workflow } from "../aggregates/Workflow.js";
import { TaskStatus } from "../enums/TaskStatus.js";

/**
 * Domain Service enforcing process completion policies and invariants.
 */
export class WorkflowPolicy {
  /**
   * Asserts if a workflow can transition to completed based on remaining required steps.
   */
  public validateCanComplete(workflow: Workflow): Result<void> {
    const unfinishedRequired = workflow.tasks.some(
      (task) => task.required && task.status !== TaskStatus.COMPLETED
    );

    if (unfinishedRequired) {
      return Result.fail(
        ResultError.conflict("Cannot complete workflow while unfinished required tasks remain.")
      );
    }
    return Result.ok();
  }
}
