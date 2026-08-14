import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { CreateWorkflowCommand } from "../commands/CreateWorkflowCommand.js";
import { WorkflowResponseDto } from "../dto/WorkflowResponseDto.js";
import { IWorkflowRepository } from "../../../business/workflow/repositories/IWorkflowRepository.js";
import { WorkflowMapper } from "../mapping/WorkflowMapper.js";

// Domain imports
import { Workflow } from "../../../business/workflow/aggregates/Workflow.js";
import { WorkflowId } from "../../../business/workflow/value-objects/WorkflowId.js";
import { WorkflowReference } from "../../../business/workflow/value-objects/WorkflowReference.js";
import { WorkflowName } from "../../../business/workflow/value-objects/WorkflowName.js";
import { WorkflowPriority, WorkflowPriorityType } from "../../../business/workflow/value-objects/WorkflowPriority.js";
import { WorkflowDeadline } from "../../../business/workflow/value-objects/WorkflowDeadline.js";
import { EscalationPolicy } from "../../../business/workflow/value-objects/EscalationPolicy.js";
import { WorkflowTask } from "../../../business/workflow/entities/WorkflowTask.js";
import { TaskTitle } from "../../../business/workflow/value-objects/TaskTitle.js";
import { AssignmentReference } from "../../../business/workflow/value-objects/AssignmentReference.js";
import { DueDate } from "../../../business/workflow/value-objects/DueDate.js";
import { TaskStatus } from "../../../business/workflow/enums/TaskStatus.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Use case handler registering a Workflow.
 */
export class CreateWorkflowCommandHandler
  implements IRequestHandler<CreateWorkflowCommand, ApplicationResult<WorkflowResponseDto>>
{
  constructor(
    private readonly repository: IWorkflowRepository,
    private readonly mapper: WorkflowMapper
  ) {}

  public async handle(
    request: CreateWorkflowCommand
  ): Promise<ApplicationResult<WorkflowResponseDto>> {
    const { dto } = request;

    const orgId = OrganizationId.from(dto.organizationId);

    // Validate reference format
    const refRes = WorkflowReference.create(dto.reference);
    if (refRes.isFailure) return ApplicationResult.failure(refRes.error.message);

    // Verify uniqueness of reference
    const existsRes = await this.repository.findByReference(orgId, refRes.value);
    if (existsRes.isSuccess && existsRes.value) {
      return ApplicationResult.failure(
        `Workflow reference '${dto.reference}' already exists in this organization.`
      );
    }

    const nameRes = WorkflowName.create(dto.name);
    if (nameRes.isFailure) return ApplicationResult.failure(nameRes.error.message);

    const priorityRes = WorkflowPriority.create(dto.priority as WorkflowPriorityType);
    if (priorityRes.isFailure) return ApplicationResult.failure(priorityRes.error.message);

    const deadlineRes = WorkflowDeadline.create(new Date(dto.deadline));
    if (deadlineRes.isFailure) return ApplicationResult.failure(deadlineRes.error.message);

    // Default Escalation thresholds: Level1 < Level2 < Level3 (ascending order)
    const policyRes = EscalationPolicy.create(3600, 7200, 10800);
    if (policyRes.isFailure) return ApplicationResult.failure(policyRes.error.message);

    // Instantiate tasks
    const tasks: WorkflowTask[] = [];
    for (const t of dto.tasks) {
      const taskTitleRes = TaskTitle.create(t.title);
      if (taskTitleRes.isFailure) return ApplicationResult.failure(taskTitleRes.error.message);

      const assigneeVO = t.assignee ? AssignmentReference.create(t.assignee).value : null;
      const dueDateVO = t.dueDate ? DueDate.create(new Date(t.dueDate)).value : null;
      const status = assigneeVO ? TaskStatus.ASSIGNED : TaskStatus.PENDING;

      const task = new WorkflowTask(new UniqueEntityID(), {
        title: taskTitleRes.value,
        assignee: assigneeVO,
        dueDate: dueDateVO,
        status,
        required: t.required !== undefined ? t.required : true,
        completedAt: null,
        rejectionReason: null
      });

      tasks.push(task);
    }

    // Create Workflow aggregate
    const workflowRes = Workflow.create(
      WorkflowId.generate(),
      orgId,
      refRes.value,
      nameRes.value,
      priorityRes.value,
      deadlineRes.value,
      policyRes.value,
      tasks
    );

    if (workflowRes.isFailure) return ApplicationResult.failure(workflowRes.error.message);
    const workflow = workflowRes.value;

    // Save and commit state
    const saveRes = await this.repository.save(workflow);
    if (saveRes.isFailure) return ApplicationResult.failure(saveRes.error.message);

    return ApplicationResult.success(this.mapper.map(workflow));
  }
}
