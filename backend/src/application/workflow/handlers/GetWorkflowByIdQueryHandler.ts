import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { GetWorkflowByIdQuery } from "../queries/GetWorkflowByIdQuery.js";
import { WorkflowResponseDto } from "../dto/WorkflowResponseDto.js";
import { IWorkflowRepository } from "../../../business/workflow/repositories/IWorkflowRepository.js";
import { WorkflowMapper } from "../mapping/WorkflowMapper.js";
import { WorkflowId } from "../../../business/workflow/value-objects/WorkflowId.js";

/**
 * Use case handler reading a Workflow by ID.
 */
export class GetWorkflowByIdQueryHandler
  implements IRequestHandler<GetWorkflowByIdQuery, ApplicationResult<WorkflowResponseDto>>
{
  constructor(
    private readonly repository: IWorkflowRepository,
    private readonly mapper: WorkflowMapper
  ) {}

  public async handle(
    request: GetWorkflowByIdQuery
  ): Promise<ApplicationResult<WorkflowResponseDto>> {
    const wrkId = WorkflowId.from(request.id);
    const loadRes = await this.repository.findById(wrkId);
    if (loadRes.isFailure) {
      return ApplicationResult.failure(loadRes.error.message);
    }
    return ApplicationResult.success(this.mapper.map(loadRes.value));
  }
}
