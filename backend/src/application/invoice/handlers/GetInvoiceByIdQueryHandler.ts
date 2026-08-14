import { IRequestHandler } from "../../foundation/handlers/IRequestHandler.js";
import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { GetInvoiceByIdQuery } from "../queries/GetInvoiceByIdQuery.js";
import { InvoiceResponseDto } from "../dto/InvoiceResponseDto.js";
import { IInvoiceRepository } from "../../../business/invoice/repositories/IInvoiceRepository.js";
import { InvoiceMapper } from "../mapping/InvoiceMapper.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";

/**
 * Use case handler reading an Invoice by ID.
 */
export class GetInvoiceByIdQueryHandler
  implements IRequestHandler<GetInvoiceByIdQuery, ApplicationResult<InvoiceResponseDto>>
{
  constructor(
    private readonly repository: IInvoiceRepository,
    private readonly mapper: InvoiceMapper
  ) {}

  public async handle(
    request: GetInvoiceByIdQuery
  ): Promise<ApplicationResult<InvoiceResponseDto>> {
    const invId = InvoiceId.from(request.id);
    const loadRes = await this.repository.findById(invId);
    if (loadRes.isFailure) {
      return ApplicationResult.failure(loadRes.error.message);
    }
    return ApplicationResult.success(this.mapper.map(loadRes.value));
  }
}
