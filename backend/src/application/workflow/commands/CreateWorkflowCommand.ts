import { ICommand } from "../../foundation/commands/ICommand.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { CreateWorkflowRequestDto } from "../dto/CreateWorkflowRequestDto.js";
import { WorkflowResponseDto } from "../dto/WorkflowResponseDto.js";

/**
 * Command to request registration of a Workflow.
 */
export class CreateWorkflowCommand
  implements ICommand<ApplicationResult<WorkflowResponseDto>>
{
  constructor(public readonly dto: CreateWorkflowRequestDto) {}
}
