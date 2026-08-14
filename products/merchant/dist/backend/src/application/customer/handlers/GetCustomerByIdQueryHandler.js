import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
/**
 * Use case handler reading a Customer aggregate by ID.
 */
export class GetCustomerByIdQueryHandler {
    repository;
    mapper;
    constructor(repository, mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
    async handle(request) {
        const custId = CustomerId.from(request.id);
        const loadRes = await this.repository.findById(custId);
        if (loadRes.isFailure) {
            return ApplicationResult.failure(loadRes.error.message);
        }
        return ApplicationResult.success(this.mapper.map(loadRes.value));
    }
}
