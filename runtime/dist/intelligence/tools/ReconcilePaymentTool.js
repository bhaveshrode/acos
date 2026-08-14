import { SubmitPaymentCommand } from "../../backend/src/application/payment/commands/SubmitPaymentCommand.js";
export class ReconcilePaymentTool {
    descriptor = {
        id: "tool_reconcile_payment",
        name: "ReconcilePaymentTool",
        description: "Reconciles a received payment by submitting it against an invoice.",
        permissions: ["payment.reconcile", "payment.submit"],
        riskLevel: "LOW",
        requiredApproval: false
    };
    async execute(payload, mediator) {
        if (!payload.invoiceId || !payload.paymentId || !payload.amount) {
            throw new Error("Missing required parameters: invoiceId, paymentId, amount.");
        }
        const command = new SubmitPaymentCommand({
            organizationId: payload.organizationId || "org-456",
            customerId: payload.customerId || "cust-123",
            reference: payload.paymentId,
            amount: payload.amount,
            currency: payload.currency || "USD",
            method: payload.method || "BANK_TRANSFER",
            invoiceId: payload.invoiceId,
            allocatedAmount: payload.amount,
            transactionHash: payload.transactionHash || "0xmocktxhash"
        });
        return await mediator.send(command);
    }
}
