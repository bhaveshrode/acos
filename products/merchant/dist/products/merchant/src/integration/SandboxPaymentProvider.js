/**
 * Concrete implementation of IPaymentProvider simulating payment logic.
 */
export class SandboxPaymentProvider {
    initiated = new Map();
    getName() {
        return "SANDBOX_PROVIDER";
    }
    async initiatePayment(paymentId, amount, currency) {
        const gatewayReference = `sandbox-ref-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        this.initiated.set(gatewayReference, { paymentId, amount, currency });
        return {
            gatewayReference,
            status: "PROCESSING"
        };
    }
    async completePayment(gatewayReference, success) {
        const item = this.initiated.get(gatewayReference);
        if (!item) {
            return {
                gatewayReference,
                status: "FAILED",
                errorCode: "REF_NOT_FOUND",
                errorMessage: "Payment lookup failed: Gateway reference not found."
            };
        }
        if (success) {
            return {
                gatewayReference,
                status: "SUCCEEDED",
                transactionHash: `tx-hash-${Math.random().toString(36).substring(2, 15).toUpperCase()}`
            };
        }
        else {
            return {
                gatewayReference,
                status: "FAILED",
                errorCode: "INSUFFICIENT_FUNDS",
                errorMessage: "Simulated sandbox transaction declined due to insufficient customer balances."
            };
        }
    }
    clear() {
        this.initiated.clear();
    }
}
