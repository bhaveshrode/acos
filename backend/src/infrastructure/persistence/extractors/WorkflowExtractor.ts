import { Workflow } from "../../../business/workflow/aggregates/Workflow.js";
import { WorkflowSerializer } from "../serializers/WorkflowSerializer.js";

/**
 * Extracts distinct database records from the Workflow aggregate graph.
 */
export class WorkflowExtractor {
  public static extract(aggregate: Workflow) {
    const snapshot = WorkflowSerializer.serialize(aggregate);

    const workflowRecord = {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      reference: snapshot.reference,
      name: snapshot.name,
      status: snapshot.status,
      priority: snapshot.priority,
      deadline: snapshot.deadline,
      escalationLevel: snapshot.escalationLevel,
      level1Threshold: snapshot.escalationPolicy.level1,
      level2Threshold: snapshot.escalationPolicy.level2,
      level3Threshold: snapshot.escalationPolicy.level3,
      metadata: snapshot.metadata,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt
    };

    return {
      workflow: workflowRecord,
      tasks: snapshot.tasks.map((t) => ({
        id: t.id,
        workflowId: snapshot.id,
        title: t.title,
        assignee: t.assignee,
        dueDate: t.dueDate,
        status: t.status,
        required: t.required,
        completedAt: t.completedAt,
        rejectionReason: t.rejectionReason
      })),
      history: snapshot.history.map((h) => ({
        id: h.id,
        workflowId: snapshot.id,
        action: h.action,
        actor: h.actor,
        timestamp: h.timestamp
      })),
      assignments: snapshot.assignments.map((a) => ({
        id: a.id,
        workflowId: snapshot.id,
        assignee: a.assignee,
        assignedAt: a.assignedAt
      })),
      comments: snapshot.comments.map((c) => ({
        id: c.id,
        workflowId: snapshot.id,
        content: c.content,
        actor: c.actor,
        createdAt: c.createdAt
      }))
    };
  }
}
