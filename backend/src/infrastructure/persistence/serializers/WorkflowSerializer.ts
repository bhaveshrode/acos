import { Workflow } from "../../../business/workflow/aggregates/Workflow.js";
import { WorkflowSnapshot } from "../snapshots/WorkflowSnapshot.js";

/**
 * Serializes Workflow aggregate root into WorkflowSnapshot models.
 */
export class WorkflowSerializer {
  public static serialize(aggregate: Workflow): WorkflowSnapshot {
    return {
      id: aggregate.id.value,
      organizationId: aggregate.organizationId.value,
      reference: aggregate.reference.value,
      name: aggregate.name.value,
      status: aggregate.status,
      priority: aggregate.priority,
      deadline: aggregate.deadline.value,
      escalationLevel: aggregate.escalationLevel,
      escalationPolicy: {
        level1: aggregate.escalationPolicy.level1,
        level2: aggregate.escalationPolicy.level2,
        level3: aggregate.escalationPolicy.level3
      },
      tasks: aggregate.tasks.map((t) => ({
        id: t.id.value,
        title: t.title.value,
        assignee: t.assignee ? t.assignee.value : null,
        dueDate: t.dueDate ? t.dueDate.value : null,
        status: t.status,
        required: t.required,
        completedAt: t.completedAt,
        rejectionReason: t.rejectionReason
      })),
      history: aggregate.history.map((h) => ({
        id: h.id.value,
        action: h.action,
        actor: h.actor ? h.actor.value : null,
        timestamp: h.timestamp
      })),
      assignments: aggregate.assignments.map((a) => ({
        id: a.id.value,
        assignee: a.assignee.value,
        assignedAt: a.assignedAt
      })),
      comments: aggregate.comments.map((c) => ({
        id: c.id.value,
        content: c.content,
        actor: c.actor.value,
        createdAt: c.createdAt
      })),
      metadata: aggregate.metadata.value,
      createdAt: aggregate.createdAt,
      updatedAt: aggregate.updatedAt
    };
  }
}
