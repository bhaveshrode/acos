import { WorkflowSnapshot } from "../snapshots/WorkflowSnapshot.js";
import { WorkflowProps } from "../../../business/workflow/aggregates/Workflow.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { WorkflowReference } from "../../../business/workflow/value-objects/WorkflowReference.js";
import { WorkflowName } from "../../../business/workflow/value-objects/WorkflowName.js";
import { WorkflowStatus } from "../../../business/workflow/enums/WorkflowStatus.js";
import { WorkflowPriority } from "../../../business/workflow/enums/WorkflowPriority.js";
import { WorkflowDeadline } from "../../../business/workflow/value-objects/WorkflowDeadline.js";
import { EscalationLevel } from "../../../business/workflow/enums/EscalationLevel.js";
import { EscalationPolicy } from "../../../business/workflow/value-objects/EscalationPolicy.js";
import { WorkflowTask } from "../../../business/workflow/entities/WorkflowTask.js";
import { TaskTitle } from "../../../business/workflow/value-objects/TaskTitle.js";
import { AssignmentReference } from "../../../business/workflow/value-objects/AssignmentReference.js";
import { DueDate } from "../../../business/workflow/value-objects/DueDate.js";
import { TaskStatus } from "../../../business/workflow/enums/TaskStatus.js";
import { WorkflowHistory } from "../../../business/workflow/entities/WorkflowHistory.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { WorkflowAssignment } from "../../../business/workflow/entities/WorkflowAssignment.js";
import { WorkflowComment } from "../../../business/workflow/entities/WorkflowComment.js";
import { WorkflowMetadata } from "../../../business/workflow/value-objects/WorkflowMetadata.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Reconstructs WorkflowProps domain structure from WorkflowSnapshot persistence models.
 */
export class WorkflowDeserializer {
  public static deserialize(snapshot: WorkflowSnapshot): WorkflowProps {
    const tasks = new Map<string, WorkflowTask>();
    for (const t of snapshot.tasks) {
      tasks.set(
        t.id,
        new WorkflowTask(new UniqueEntityID(t.id), {
          title: TaskTitle.create(t.title).value,
          assignee: t.assignee ? AssignmentReference.create(t.assignee).value : null,
          dueDate: t.dueDate ? DueDate.create(t.dueDate).value : null,
          status: t.status as TaskStatus,
          required: t.required,
          completedAt: t.completedAt,
          rejectionReason: t.rejectionReason
        })
      );
    }

    const history = snapshot.history.map(
      (h) =>
        new WorkflowHistory(new UniqueEntityID(h.id), {
          action: h.action,
          actor: h.actor ? new UserId(new UniqueEntityID(h.actor)) : null,
          timestamp: h.timestamp
        })
    );

    const assignments = snapshot.assignments.map(
      (a) =>
        new WorkflowAssignment(new UniqueEntityID(a.id), {
          assignee: AssignmentReference.create(a.assignee).value,
          assignedAt: a.assignedAt
        })
    );

    const comments = snapshot.comments.map(
      (c) =>
        new WorkflowComment(new UniqueEntityID(c.id), {
          content: c.content,
          actor: new UserId(new UniqueEntityID(c.actor)),
          createdAt: c.createdAt
        })
    );

    return {
      organizationId: new OrganizationId(new UniqueEntityID(snapshot.organizationId)),
      reference: WorkflowReference.create(snapshot.reference).value,
      name: WorkflowName.create(snapshot.name).value,
      status: snapshot.status as WorkflowStatus,
      priority: snapshot.priority as WorkflowPriority,
      deadline: WorkflowDeadline.create(snapshot.deadline).value,
      escalationLevel: snapshot.escalationLevel as EscalationLevel,
      escalationPolicy: EscalationPolicy.create(
        snapshot.escalationPolicy.level1,
        snapshot.escalationPolicy.level2,
        snapshot.escalationPolicy.level3
      ).value,
      tasks,
      history,
      assignments,
      comments,
      metadata: WorkflowMetadata.create(snapshot.metadata).value,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt
    };
  }
}
