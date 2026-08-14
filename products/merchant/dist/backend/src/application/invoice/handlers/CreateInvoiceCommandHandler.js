import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
// Domain imports
import { Invoice } from "../../../business/invoice/aggregates/Invoice.js";
import { InvoiceId } from "../../../business/invoice/value-objects/InvoiceId.js";
import { InvoiceNumber } from "../../../business/invoice/value-objects/InvoiceNumber.js";
import { PaymentTerms } from "../../../business/invoice/value-objects/PaymentTerms.js";
import { DueDate } from "../../../business/invoice/value-objects/DueDate.js";
import { Money } from "../../../business/invoice/value-objects/Money.js";
import { UnitPrice } from "../../../business/invoice/value-objects/UnitPrice.js";
import { Quantity } from "../../../business/invoice/value-objects/Quantity.js";
import { TaxRate } from "../../../business/invoice/value-objects/TaxRate.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
/**
 * Use case handler registering an Invoice aggregate.
 */
export class CreateInvoiceCommandHandler {
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
        // Validate unique invoice number
        const numRes = InvoiceNumber.create(dto.invoiceNumber);
        if (numRes.isFailure)
            return ApplicationResult.failure(numRes.error.message);
        const existsRes = await this.repository.exists(orgId, numRes.value);
        if (existsRes.isFailure)
            return ApplicationResult.failure(existsRes.error.message);
        if (existsRes.value) {
            return ApplicationResult.failure(`Invoice number '${dto.invoiceNumber}' already exists in this organization.`);
        }
        // Parse value objects
        const termsRes = PaymentTerms.create(dto.paymentTerms);
        if (termsRes.isFailure)
            return ApplicationResult.failure(termsRes.error.message);
        const dueDateRes = DueDate.create(new Date(dto.dueDate));
        if (dueDateRes.isFailure)
            return ApplicationResult.failure(dueDateRes.error.message);
        // Create Invoice aggregate
        const invoiceRes = Invoice.create(InvoiceId.generate(), orgId, customerId, numRes.value, dto.currency, termsRes.value, new Date(dto.issueDate), dueDateRes.value);
        if (invoiceRes.isFailure)
            return ApplicationResult.failure(invoiceRes.error.message);
        const invoice = invoiceRes.value;
        // Add line items
        for (const line of dto.lines) {
            const moneyRes = Money.create(line.unitPrice, dto.currency);
            if (moneyRes.isFailure)
                return ApplicationResult.failure(moneyRes.error.message);
            const priceRes = UnitPrice.create(moneyRes.value);
            if (priceRes.isFailure)
                return ApplicationResult.failure(priceRes.error.message);
            const qtyRes = Quantity.create(line.quantity);
            if (qtyRes.isFailure)
                return ApplicationResult.failure(qtyRes.error.message);
            const taxRes = TaxRate.create(line.taxRate);
            if (taxRes.isFailure)
                return ApplicationResult.failure(taxRes.error.message);
            const addLineRes = invoice.addLineItem(new UniqueEntityID(), line.description, qtyRes.value, priceRes.value, taxRes.value);
            if (addLineRes.isFailure)
                return ApplicationResult.failure(addLineRes.error.message);
        }
        // Save and commit Invoice aggregate
        const saveRes = await this.repository.save(invoice);
        if (saveRes.isFailure)
            return ApplicationResult.failure(saveRes.error.message);
        return ApplicationResult.success(this.mapper.map(invoice));
    }
}
