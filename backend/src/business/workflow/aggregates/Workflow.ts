import { AggregateRoot } from "../../../foundation/core/AggregateRoot.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

// Value Objects
import { WorkflowId } from "../value-objects/WorkflowId.js";
import { WorkflowReference } from "../value-objects/WorkflowReference.js";
import { WorkflowName } from "../value-objects/WorkflowName.js";
import { TaskTitle } from "../value-objects/TaskTitle.js";
import { DueDate } from "../value-objects/DueDate.js";
import { WorkflowPriority } from "../value-objects/WorkflowPriority.js";
import { WorkflowDeadline } from "../value-objects/WorkflowDeadline.js";
import { AssignmentReference } from "../value-objects/AssignmentReference.js";
import { WorkflowMetadata } from "../value-objects/WorkflowMetadata.js";
import { EscalationPolicy } from "../value-objects/EscalationPolicy.js";

// Entities
import { WorkflowTask } from "../entities/WorkflowTask.js";
import { WorkflowHistory } from "../entities/WorkflowHistory.js";
import { WorkflowAssignment } from "../entities/WorkflowAssignment.js";
import { WorkflowComment } from "../entities/WorkflowComment.js";

// Enums
import { WorkflowStatus } from "../enums/WorkflowStatus.js";
import { TaskStatus } from "../enums/TaskStatus.js";
import { EscalationLevel } from "../enums/EscalationLevel.js";

// References
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { UserId } from "../../identity/value-objects/UserId.js";

// Domain Events
import { WorkflowCreated } from "../events/WorkflowCreated.js";
import { WorkflowStarted } from "../events/WorkflowStarted.js";
import { TaskAssigned } from "../events/TaskAssigned.js";
import { TaskCompleted } from "../events/TaskCompleted.js";
import { TaskRejected } from "../events/TaskRejected.js";
import { WorkflowEscalated } from "../events/WorkflowEscalated.js";
import { WorkflowCompleted } from "../events/WorkflowCompleted.js";
import { WorkflowCancelled } from "../events/WorkflowCancelled.js";
import { WorkflowExpired } from "../events/WorkflowExpired.js";
import { WorkflowFailed } from "../events/WorkflowFailed.js";

export interface WorkflowProps {
  organizationId: OrganizationId;
  reference: WorkflowReference;
  name: WorkflowName;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  deadline: WorkflowDeadline;
  escalationLevel: EscalationLevel;
  escalationPolicy: EscalationPolicy;
  tasks: Map<string, WorkflowTask>;
  history: WorkflowHistory[];
  assignments: WorkflowAssignment[];
  comments: WorkflowComment[];
  metadata: WorkflowMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate Root guarding the lifecycle coordination of multi-step business processes.
 */
export class Workflow extends AggregateRoot<WorkflowId> {
  private readonly props: WorkflowProps;

  private constructor(id: WorkflowId, props: WorkflowProps) {
    super(id);
    this.props = props;
  }

  /**
   * Factory constructor initializing a Workflow in DRAFT status.
   */
  public static create(
    id: WorkflowId,
    organizationId: OrganizationId,
    reference: WorkflowReference,
    name: WorkflowName,
    priority: WorkflowPriority,
    deadline: WorkflowDeadline,
    escalationPolicy: EscalationPolicy,
    initialTasks: WorkflowTask[],
    optional?: {
      metadata?: WorkflowMetadata;
      history?: WorkflowHistory[];
      assignments?: WorkflowAssignment[];
      comments?: WorkflowComment[];
      createdAt?: Date;
      updatedAt?: Date;
    }
  ): Result<Workflow> {
    // Invariant: Must contain at least one task step
    if (initialTasks.length === 0) {
      return Result.fail(ResultError.validation("Workflow must contain at least one task step."));
    }

    const tasks = new Map<string, WorkflowTask>();
    initialTasks.forEach((task) => tasks.set(task.id.value, task));

    const workflow = new Workflow(id, {
      organizationId,
      reference,
      name,
      status: WorkflowStatus.DRAFT,
      priority,
      deadline,
      escalationLevel: EscalationLevel.NONE,
      escalationPolicy,
      tasks,
      history: optional?.history || [],
      assignments: optional?.assignments || [],
      comments: optional?.comments || [],
      metadata: optional?.metadata || WorkflowMetadata.create().value,
      createdAt: optional?.createdAt || new Date(),
      updatedAt: optional?.updatedAt || new Date()
    });

    workflow.addDomainEvent(new WorkflowCreated(id.value, organizationId, reference));
    workflow.logHistoryEntry("Workflow created in draft state", null);
    return Result.ok(workflow);
  }

  // Getters
  public get organizationId(): OrganizationId { return this.props.organizationId; }
  public get reference(): WorkflowReference { return this.props.reference; }
  public get name(): WorkflowName { return this.props.name; }
  public get status(): WorkflowStatus { return this.props.status; }
  public get priority(): WorkflowPriority { return this.props.priority; }
  public get deadline(): WorkflowDeadline { return this.props.deadline; }
  public get escalationLevel(): EscalationLevel { return this.props.escalationLevel; }
  public get escalationPolicy(): EscalationPolicy { return this.props.escalationPolicy; }
  public get tasks(): readonly WorkflowTask[] { return Object.freeze(Array.from(this.props.tasks.values())); }
  public get history(): readonly WorkflowHistory[] { return Object.freeze([...this.props.history]); }
  public get assignments(): readonly WorkflowAssignment[] { return Object.freeze([...this.props.assignments]); }
  public get comments(): readonly WorkflowComment[] { return Object.freeze([...this.props.comments]); }
  public get metadata(): WorkflowMetadata { return this.props.metadata; }
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }

  private logHistoryEntry(action: string, actor: UserId | null): void {
    const historyEntry = new WorkflowHistory(new UniqueEntityID(), {
      action,
      actor,
      timestamp: new Date()
    });
    this.props.history.push(historyEntry);
  }

  private ensureMutable(): Result<void> {
    if (
      this.status === WorkflowStatus.COMPLETED ||
      this.status === WorkflowStatus.CANCELLED ||
      this.status === WorkflowStatus.EXPIRED ||
      this.status === WorkflowStatus.FAILED
    ) {
      return Result.fail(ResultError.conflict(`Completed/locked workflows are immutable. Current status: ${this.status}.`));
    }
    return Result.ok();
  }

  /**
   * Appends an additional task while in DRAFT status.
   */
  public addTask(task: WorkflowTask): Result<void> {
    if (this.status !== WorkflowStatus.DRAFT) {
      return Result.fail(ResultError.conflict("Tasks can only be added while in DRAFT status."));
    }
    this.props.tasks.set(task.id.value, task);
    this.props.updatedAt = new Date();
    this.logHistoryEntry(`Task added: '${task.title.value}'`, null);
    return Result.ok();
  }

  /**
   * Starts workflow execution.
   */
  public start(actor: UserId): Result<void> {
    if (this.status !== WorkflowStatus.DRAFT) {
      return Result.fail(ResultError.conflict("Only draft workflows can be started."));
    }

    this.props.status = WorkflowStatus.RUNNING;
    this.props.updatedAt = new Date();

    this.logHistoryEntry("Workflow execution started", actor);
    this.addDomainEvent(new WorkflowStarted(this.id.value));
    return Result.ok();
  }

  /**
   * Assigns a task step to an actor.
   */
  public assignTask(taskId: UniqueEntityID, assignee: AssignmentReference, actor: UserId): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    const task = this.props.tasks.get(taskId.value);
    if (!task) return Result.fail(ResultError.notFound("Workflow task not found."));

    task.assign(assignee);
    const assignmentRecord = new WorkflowAssignment(new UniqueEntityID(), {
      assignee,
      assignedAt: new Date()
    });
    this.props.assignments.push(assignmentRecord);
    this.props.updatedAt = new Date();

    this.logHistoryEntry(`Task '${task.title.value}' assigned to ${assignee.value}`, actor);
    this.addDomainEvent(new TaskAssigned(this.id.value, taskId.value, assignee));
    return Result.ok();
  }

  /**
   * Completes a task step.
   * If all required tasks are completed, completes the workflow instance automatically.
   */
  public completeTask(taskId: UniqueEntityID, actor: UserId): Result<void> {
    if (this.status !== WorkflowStatus.RUNNING) {
      return Result.fail(ResultError.conflict("Tasks can only be completed on running workflows."));
    }

    const task = this.props.tasks.get(taskId.value);
    if (!task) return Result.fail(ResultError.notFound("Workflow task not found."));

    // Invariant: task cannot be completed twice
    if (task.status === TaskStatus.COMPLETED) {
      return Result.fail(ResultError.conflict("Task is already completed."));
    }

    task.complete();
    this.props.updatedAt = new Date();
    this.logHistoryEntry(`Task '${task.title.value}' marked complete`, actor);
    this.addDomainEvent(new TaskCompleted(this.id.value, taskId.value));

    // Check completion condition: all required tasks must be completed
    const unfinishedRequired = Array.from(this.props.tasks.values()).some(
      (t) => t.required && t.status !== TaskStatus.COMPLETED
    );

    if (!unfinishedRequired) {
      this.props.status = WorkflowStatus.COMPLETED;
      this.logHistoryEntry("All required tasks completed. Workflow completed.", null);
      this.addDomainEvent(new WorkflowCompleted(this.id.value));
    }

    return Result.ok();
  }

  /**
   * Rejects a task step.
   * Rejects require a reason. Required task rejection fails the workflow.
   */
  public rejectTask(taskId: UniqueEntityID, reason: string, actor: UserId): Result<void> {
    if (this.status !== WorkflowStatus.RUNNING) {
      return Result.fail(ResultError.conflict("Tasks can only be rejected on running workflows."));
    }

    const task = this.props.tasks.get(taskId.value);
    if (!task) return Result.fail(ResultError.notFound("Workflow task not found."));

    const rejectRes = task.reject(reason);
    if (rejectRes.isFailure) return Result.fail(rejectRes.error);

    this.props.updatedAt = new Date();
    this.logHistoryEntry(`Task '${task.title.value}' rejected. Reason: ${reason}`, actor);
    this.addDomainEvent(new TaskRejected(this.id.value, taskId.value, reason));

    // Invariant: If a required task is rejected, the overall workflow fails
    if (task.required) {
      this.props.status = WorkflowStatus.FAILED;
      this.logHistoryEntry(`Required task '${task.title.value}' rejected. Workflow failed.`, null);
      this.addDomainEvent(new WorkflowFailed(this.id.value, `Required task '${task.title.value}' was rejected.`));
    }

    return Result.ok();
  }

  /**
   * Escalates the workflow urgency tier.
   * Escalation levels cannot decrease.
   */
  public escalate(level: EscalationLevel): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    const levelValues: Record<EscalationLevel, number> = {
      [EscalationLevel.NONE]: 0,
      [EscalationLevel.LEVEL1]: 1,
      [EscalationLevel.LEVEL2]: 2,
      [EscalationLevel.LEVEL3]: 3
    };

    if (levelValues[level] <= levelValues[this.props.escalationLevel]) {
      return Result.fail(ResultError.conflict("Escalation level can only increase."));
    }

    this.props.escalationLevel = level;
    this.props.updatedAt = new Date();

    this.logHistoryEntry(`Workflow escalated to level: ${level}`, null);
    this.addDomainEvent(new WorkflowEscalated(this.id.value, level));
    return Result.ok();
  }

  /**
   * Cancels workflow execution.
   */
  public cancel(): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    this.props.status = WorkflowStatus.CANCELLED;
    this.props.updatedAt = new Date();

    // Cancel all unfinished tasks
    this.props.tasks.forEach((task) => {
      if (task.status !== TaskStatus.COMPLETED && task.status !== TaskStatus.REJECTED) {
        task.cancel();
      }
    });

    this.logHistoryEntry("Workflow execution cancelled", null);
    this.addDomainEvent(new WorkflowCancelled(this.id.value));
    return Result.ok();
  }

  /**
   * Expires the workflow.
   */
  public expire(): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    this.props.status = WorkflowStatus.EXPIRED;
    this.props.updatedAt = new Date();

    this.logHistoryEntry("Workflow execution expired due to deadline breach", null);
    this.addDomainEvent(new WorkflowExpired(this.id.value));
    return Result.ok();
  }

  /**
   * Appends review commentary.
   */
  public addComment(commentId: UniqueEntityID, content: string, actor: UserId): Result<void> {
    if (!content || content.trim() === "") {
      return Result.fail(ResultError.validation("Comment content cannot be empty."));
    }

    const comment = new WorkflowComment(commentId, {
      content: content.trim(),
      actor,
      createdAt: new Date()
    });

    this.props.comments.push(comment);
    this.props.updatedAt = new Date();
    this.logHistoryEntry(`Comment logged by ${actor.value}`, actor);
    return Result.ok();
  }
}
