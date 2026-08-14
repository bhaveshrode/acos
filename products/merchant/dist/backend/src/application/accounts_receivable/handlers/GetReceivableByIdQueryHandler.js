import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { ReceivableAccountId } from "../../../business/accounts_receivable/value-objects/ReceivableAccountId.js";
/**
 * Use case handler reading an Accounts Receivable profile by ID.
 */
export class GetReceivableByIdQueryHandler {
    repository;
    mapper;
    constructor(repository, mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
    async handle(request) {
        const accId = ReceivableAccountId.from(request.id);
        const loadRes = await this.repository.findById(accId);
        if (loadRes.isFailure) {
            return ApplicationResult.failure(loadRes.error.message);
        }
        return ApplicationResult.success(this.mapper.map(loadRes.value));
    }
}
