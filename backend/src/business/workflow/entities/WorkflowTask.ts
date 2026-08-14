import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { TaskTitle } from "../value-objects/TaskTitle.js";
import { AssignmentReference } from "../value-objects/AssignmentReference.js";
import { DueDate } from "../value-objects/DueDate.js";
import { TaskStatus } from "../enums/TaskStatus.js";

export interface WorkflowTaskProps {
  title: TaskTitle;
  assignee: AssignmentReference | null;
  dueDate: DueDate | null;
  status: TaskStatus;
  required: boolean;
  completedAt: Date | null;
  rejectionReason: string | null;
}

/**
 * Child Entity representing an execution step in the Workflow instance.
 */
export class WorkflowTask extends Entity<UniqueEntityID> {
  private props: WorkflowTaskProps;

  constructor(id: UniqueEntityID, props: WorkflowTaskProps) {
    super(id);
    this.props = props;
  }

  public get title(): TaskTitle { return this.props.title; }
  public get assignee(): AssignmentReference | null { return this.props.assignee; }
  public get dueDate(): DueDate | null { return this.props.dueDate; }
  public get status(): TaskStatus { return this.props.status; }
  public get required(): boolean { return this.props.required; }
  public get completedAt(): Date | null { return this.props.completedAt; }
  public get rejectionReason(): string | null { return this.props.rejectionReason; }

  /**
   * Assigns the task to a reference entity.
   */
  public assign(assignee: AssignmentReference): void {
    this.props.assignee = assignee;
    this.props.status = TaskStatus.ASSIGNED;
  }

  /**
   * Puts task in Progress.
   */
  public start(): void {
    this.props.status = TaskStatus.IN_PROGRESS;
  }

  /**
   * Completes task.
   */
  public complete(): void {
    this.props.status = TaskStatus.COMPLETED;
    this.props.completedAt = new Date();
    this.props.rejectionReason = null;
  }

  /**
   * Rejects task, enforcing a justification reason.
   */
  public reject(reason: string): Result<void> {
    if (!reason || reason.trim() === "") {
      return Result.fail(ResultError.validation("Rejection reason cannot be empty."));
    }
    this.props.status = TaskStatus.REJECTED;
    this.props.rejectionReason = reason.trim();
    this.props.completedAt = new Date();
    return Result.ok();
  }

  /**
   * Cancels the task.
   */
  public cancel(): void {
    this.props.status = TaskStatus.CANCELLED;
  }

  /**
   * Skips task execution.
   */
  public skip(): void {
    this.props.status = TaskStatus.SKIPPED;
  }
}
