import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { PaymentId } from "../../../business/payment/value-objects/PaymentId.js";
/**
 * Use case handler reading a Payment by ID.
 */
export class GetPaymentByIdQueryHandler {
    repository;
    mapper;
    constructor(repository, mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
    async handle(request) {
        const payId = PaymentId.from(request.id);
        const loadRes = await this.repository.findById(payId);
        if (loadRes.isFailure) {
            return ApplicationResult.failure(loadRes.error.message);
        }
        return ApplicationResult.success(this.mapper.map(loadRes.value));
    }
}
