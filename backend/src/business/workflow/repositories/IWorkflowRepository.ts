import { Workflow } from "../aggregates/Workflow.js";
import { WorkflowId } from "../value-objects/WorkflowId.js";
import { WorkflowReference } from "../value-objects/WorkflowReference.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { AssignmentReference } from "../value-objects/AssignmentReference.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Domain Repository interface for Workflow aggregate root operations.
 */
export interface IWorkflowRepository {
  /**
   * Retrieves a Workflow by its unique ID.
   */
  findById(id: WorkflowId): Promise<Result<Workflow>>;

  /**
   * Retrieves a Workflow by its unique business reference.
   */
  findByReference(orgId: OrganizationId, ref: WorkflowReference): Promise<Result<Workflow>>;

  /**
   * Retrieves all running workflows.
   */
  findRunning(orgId: OrganizationId): Promise<Result<Workflow[]>>;

  /**
   * Retrieves all workflows that contain a task assigned to the specified assignee.
   */
  findByAssignee(orgId: OrganizationId, assignee: AssignmentReference): Promise<Result<Workflow[]>>;

  /**
   * Saves or updates a Workflow aggregate in database.
   */
  save(workflow: Workflow): Promise<Result<void>>;

  /**
   * Permanently deletes a Workflow aggregate.
   */
  delete(id: WorkflowId): Promise<Result<void>>;
}
