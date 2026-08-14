import { IMapper } from "../../foundation/mapping/IMapper.js";
import { Workflow } from "../../../business/workflow/aggregates/Workflow.js";
import { WorkflowResponseDto } from "../dto/WorkflowResponseDto.js";

/**
 * Mapper helper converting Workflow entities into presentation WorkflowResponseDto models.
 */
export class WorkflowMapper implements IMapper<Workflow, WorkflowResponseDto> {
  public map(source: Workflow): WorkflowResponseDto {
    return {
      id: source.id.value,
      organizationId: source.organizationId.value,
      reference: source.reference.value,
      name: source.name.value,
      status: source.status,
      priority: source.priority.value,
      deadline: source.deadline.value.toISOString(),
      tasks: source.tasks.map((task) => ({
        id: task.id.value,
        title: task.title.value,
        assignee: task.assignee ? task.assignee.value : null,
        dueDate: task.dueDate ? task.dueDate.value.toISOString() : null,
        status: task.status,
        required: task.required
      })),
      createdAt: source.createdAt.toISOString()
    };
  }
}
