import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
// Domain imports
import { AccountsReceivable } from "../../../business/accounts_receivable/aggregates/AccountsReceivable.js";
import { ReceivableAccountId } from "../../../business/accounts_receivable/value-objects/ReceivableAccountId.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";
import { Money } from "../../../business/invoice/value-objects/Money.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
/**
 * Use case handler recording a Receivable.
 */
export class RecordReceivableCommandHandler {
    repository;
    mapper;
    constructor(repository, mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
    async handle(request) {
        const { dto } = request;
        const orgId = OrganizationId.from(dto.organizationId);
        const customerId = CustomerId.from(dto.customerId);
        const invoiceId = InvoiceId.from(dto.invoiceId);
        // Validate money values
        const moneyRes = Money.create(dto.amount, dto.currency);
        if (moneyRes.isFailure)
            return ApplicationResult.failure(moneyRes.error.message);
        // Load or initialize Customer Accounts Receivable account
        let ar;
        const findRes = await this.repository.findByCustomer(orgId, customerId);
        if (findRes.isSuccess && findRes.value) {
            ar = findRes.value;
        }
        else {
            const createRes = AccountsReceivable.create(ReceivableAccountId.generate(), orgId, customerId);
            if (createRes.isFailure)
                return ApplicationResult.failure(createRes.error.message);
            ar = createRes.value;
        }
        // Add invoice entry to customer obligations
        const entryRes = ar.addInvoice(new UniqueEntityID(), invoiceId, moneyRes.value, new Date(dto.dueDate));
        if (entryRes.isFailure)
            return ApplicationResult.failure(entryRes.error.message);
        // Save and commit aggregate state
        const saveRes = await this.repository.save(ar);
        if (saveRes.isFailure)
            return ApplicationResult.failure(saveRes.error.message);
        return ApplicationResult.success(this.mapper.map(ar));
    }
}
