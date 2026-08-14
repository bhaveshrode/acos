import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";
/**
 * Use case handler reading an Invoice by ID.
 */
export class GetInvoiceByIdQueryHandler {
    repository;
    mapper;
    constructor(repository, mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
    async handle(request) {
        const invId = InvoiceId.from(request.id);
        const loadRes = await this.repository.findById(invId);
        if (loadRes.isFailure) {
            return ApplicationResult.failure(loadRes.error.message);
        }
        return ApplicationResult.success(this.mapper.map(loadRes.value));
    }
}
