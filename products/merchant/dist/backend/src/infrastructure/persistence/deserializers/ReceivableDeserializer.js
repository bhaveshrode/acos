"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceivableDeserializer = void 0;
const OrganizationId_js_1 = require("../../../business/organization/value-objects/OrganizationId.js");
const CustomerId_js_1 = require("../../../business/customer/value-objects/CustomerId.js");
const ReceivableEntry_js_1 = require("../../../business/accounts_receivable/entities/ReceivableEntry.js");
const InvoiceId_js_1 = require("../../../business/invoice/value-objects/InvoiceId.js");
const Money_js_1 = require("../../../business/invoice/value-objects/Money.js");
const PaymentApplication_js_1 = require("../../../business/accounts_receivable/entities/PaymentApplication.js");
const SettlementId_js_1 = require("../../../business/settlement/value-objects/SettlementId.js");
const CustomerCredit_js_1 = require("../../../business/accounts_receivable/entities/CustomerCredit.js");
const CreditReason_js_1 = require("../../../business/accounts_receivable/value-objects/CreditReason.js");
const CollectionAction_js_1 = require("../../../business/accounts_receivable/entities/CollectionAction.js");
const UserId_js_1 = require("../../../business/identity/value-objects/UserId.js");
const Identifier_js_1 = require("../../../foundation/core/Identifier.js");
/**
 * Reconstructs AccountsReceivableProps domain structure from ReceivableSnapshot persistence models.
 */
class ReceivableDeserializer {
    static deserialize(snapshot) {
        const entries = new Map();
        for (const e of snapshot.entries) {
            entries.set(e.id, new ReceivableEntry_js_1.ReceivableEntry(new Identifier_js_1.UniqueEntityID(e.id), {
                invoiceId: new InvoiceId_js_1.InvoiceId(new Identifier_js_1.UniqueEntityID(e.invoiceId)),
                originalAmount: Money_js_1.Money.create(e.originalAmount, e.currency).value,
                remainingBalance: Money_js_1.Money.create(e.remainingBalance, e.currency).value,
                dueDate: e.dueDate
            }));
        }
        const paymentApplications = snapshot.paymentApplications.map((p) => new PaymentApplication_js_1.PaymentApplication(new Identifier_js_1.UniqueEntityID(p.id), {
            settlementId: new SettlementId_js_1.SettlementId(new Identifier_js_1.UniqueEntityID(p.settlementId)),
            invoiceId: new InvoiceId_js_1.InvoiceId(new Identifier_js_1.UniqueEntityID(p.invoiceId)),
            appliedAmount: Money_js_1.Money.create(p.appliedAmount, p.currency).value,
            appliedAt: p.appliedAt
        }));
        const customerCredits = snapshot.customerCredits.map((c) => new CustomerCredit_js_1.CustomerCredit(new Identifier_js_1.UniqueEntityID(c.id), {
            source: c.source,
            amount: Money_js_1.Money.create(c.amount, c.currency).value,
            remainingBalance: Money_js_1.Money.create(c.remainingBalance, c.currency).value,
            reason: CreditReason_js_1.CreditReason.create(c.reason).value,
            createdAt: c.createdAt
        }));
        const collectionActions = snapshot.collectionActions.map((ca) => new CollectionAction_js_1.CollectionAction(new Identifier_js_1.UniqueEntityID(ca.id), {
            actionType: ca.actionType,
            notes: ca.notes,
            performedBy: new UserId_js_1.UserId(new Identifier_js_1.UniqueEntityID(ca.performedBy)),
            timestamp: ca.timestamp
        }));
        return {
            organizationId: new OrganizationId_js_1.OrganizationId(new Identifier_js_1.UniqueEntityID(snapshot.organizationId)),
            customerId: new CustomerId_js_1.CustomerId(new Identifier_js_1.UniqueEntityID(snapshot.customerId)),
            status: snapshot.status,
            collectionStatus: snapshot.collectionStatus,
            entries,
            paymentApplications,
            customerCredits,
            collectionActions,
            createdAt: snapshot.createdAt,
            updatedAt: snapshot.updatedAt
        };
    }
}
exports.ReceivableDeserializer = ReceivableDeserializer;
