import { IQuery } from "../../foundation/queries/IQuery.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { WorkflowResponseDto } from "../dto/WorkflowResponseDto.js";

/**
 * Query to request loading Workflow details by ID.
 */
export class GetWorkflowByIdQuery implements IQuery<ApplicationResult<WorkflowResponseDto>> {
  constructor(public readonly id: string) {}
}
