import { AggregateRoot } from "../../../foundation/core/AggregateRoot.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { PaymentMetadata } from "../value-objects/PaymentMetadata.js";
import { ConfirmationCount } from "../value-objects/ConfirmationCount.js";
// Submodule Entities
import { PaymentAllocation } from "../entities/PaymentAllocation.js";
import { PaymentAttempt } from "../entities/PaymentAttempt.js";
import { RefundRequest } from "../entities/RefundRequest.js";
// Submodule Enums
import { PaymentStatus } from "../enums/PaymentStatus.js";
import { AllocationStatus } from "../enums/AllocationStatus.js";
import { RefundStatus } from "../enums/RefundStatus.js";
// Submodule Events
import { PaymentCreated } from "../events/PaymentCreated.js";
import { PaymentSubmitted } from "../events/PaymentSubmitted.js";
import { PaymentProcessingStarted } from "../events/PaymentProcessingStarted.js";
import { PaymentConfirmed } from "../events/PaymentConfirmed.js";
import { PaymentFailed } from "../events/PaymentFailed.js";
import { PaymentCancelled } from "../events/PaymentCancelled.js";
import { PaymentAllocated } from "../events/PaymentAllocated.js";
import { RefundRequested } from "../events/RefundRequested.js";
// Submodule Specifications
import { PaymentCanBeCancelled } from "../specifications/PaymentCanBeCancelled.js";
import { PaymentCanBeConfirmed } from "../specifications/PaymentCanBeConfirmed.js";
/**
 * Aggregate Root guarding transaction processing states, allocation values, and refund limits.
 */
export class Payment extends AggregateRoot {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    /**
     * Factory constructor to initialize a Payment in PENDING status.
     * Guarantees at least one invoice allocation on creation.
     */
    static create(id, organizationId, customerId, reference, amount, method, initialInvoiceId, initialAllocatedAmount, optional) {
        if (initialAllocatedAmount.currency !== amount.currency) {
            return Result.fail(ResultError.conflict("Allocation currency does not match payment currency."));
        }
        if (initialAllocatedAmount.amount > amount.amount) {
            return Result.fail(ResultError.conflict("Allocation amount cannot exceed the total payment amount."));
        }
        const allocations = new Map();
        const allocationId = new UniqueEntityID();
        const initialAllocation = new PaymentAllocation(allocationId, {
            invoiceId: initialInvoiceId,
            allocatedAmount: initialAllocatedAmount,
            status: AllocationStatus.PENDING
        });
        allocations.set(allocationId.value, initialAllocation);
        const payment = new Payment(id, {
            organizationId,
            customerId,
            reference,
            amount,
            status: PaymentStatus.PENDING,
            method,
            transactionHash: optional?.transactionHash || null,
            gatewayReference: optional?.gatewayReference || null,
            walletAddress: optional?.walletAddress || null,
            metadata: optional?.metadata || PaymentMetadata.create().value,
            confirmations: optional?.confirmations || ConfirmationCount.create(0).value,
            exchangeRate: optional?.exchangeRate || null,
            allocations,
            attempts: optional?.attempts || [],
            refundRequests: new Map(),
            createdAt: optional?.createdAt || new Date(),
            updatedAt: optional?.updatedAt || new Date()
        });
        payment.addDomainEvent(new PaymentCreated(id.value, organizationId, customerId, amount));
        return Result.ok(payment);
    }
    // Getters
    get organizationId() { return this.props.organizationId; }
    get customerId() { return this.props.customerId; }
    get reference() { return this.props.reference; }
    get amount() { return this.props.amount; }
    get status() { return this.props.status; }
    get method() { return this.props.method; }
    get transactionHash() { return this.props.transactionHash; }
    get gatewayReference() { return this.props.gatewayReference; }
    get walletAddress() { return this.props.walletAddress; }
    get metadata() { return this.props.metadata; }
    get confirmations() { return this.props.confirmations; }
    get exchangeRate() { return this.props.exchangeRate; }
    get allocations() { return Object.freeze(Array.from(this.props.allocations.values())); }
    get attempts() { return Object.freeze([...this.props.attempts]); }
    get refundRequests() { return Object.freeze(Array.from(this.props.refundRequests.values())); }
    get createdAt() { return this.props.createdAt; }
    get updatedAt() { return this.props.updatedAt; }
    ensureMutable() {
        if (this.status === PaymentStatus.CONFIRMED) {
            return Result.fail(ResultError.conflict("Confirmed payments cannot be edited."));
        }
        if (this.status === PaymentStatus.CANCELLED) {
            return Result.fail(ResultError.conflict("Cancelled payments are locked."));
        }
        return Result.ok();
    }
    /**
     * Logs a submit processing attempt on the gateway provider.
     */
    submit(attemptId) {
        const editCheck = this.ensureMutable();
        if (editCheck.isFailure)
            return Result.fail(editCheck.error);
        this.props.status = PaymentStatus.SUBMITTED;
        const attempt = new PaymentAttempt(attemptId, {
            timestamp: new Date(),
            status: PaymentStatus.SUBMITTED,
            gatewayResponse: "Submitted to gateway",
            errorCode: null
        });
        this.props.attempts.push(attempt);
        this.props.updatedAt = new Date();
        this.addDomainEvent(new PaymentSubmitted(this.id.value));
        return Result.ok();
    }
    /**
     * Gateway starts parsing transaction.
     */
    startProcessing(attemptId, gatewayRef) {
        const editCheck = this.ensureMutable();
        if (editCheck.isFailure)
            return Result.fail(editCheck.error);
        this.props.status = PaymentStatus.PROCESSING;
        this.props.gatewayReference = gatewayRef;
        const attempt = new PaymentAttempt(attemptId, {
            timestamp: new Date(),
            status: PaymentStatus.PROCESSING,
            gatewayResponse: "Gateway processing acknowledged",
            errorCode: null
        });
        this.props.attempts.push(attempt);
        this.props.updatedAt = new Date();
        this.addDomainEvent(new PaymentProcessingStarted(this.id.value));
        return Result.ok();
    }
    /**
     * Confirms payment processing. Transition allocations status to ALLOCATED.
     */
    confirm(attemptId, txHash, confirmationCount) {
        if (this.status === PaymentStatus.CONFIRMED)
            return Result.ok();
        const spec = new PaymentCanBeConfirmed();
        if (!spec.isSatisfiedBy(this)) {
            return Result.fail(ResultError.conflict(`Cannot confirm a payment in state ${this.status}.`));
        }
        this.props.status = PaymentStatus.CONFIRMED;
        this.props.transactionHash = txHash;
        this.props.confirmations = confirmationCount;
        // Transition all allocations to ALLOCATED status
        this.props.allocations.forEach((alloc) => {
            alloc.allocate();
            this.addDomainEvent(new PaymentAllocated(this.id.value, alloc.invoiceId, alloc.allocatedAmount));
        });
        const attempt = new PaymentAttempt(attemptId, {
            timestamp: new Date(),
            status: PaymentStatus.CONFIRMED,
            gatewayResponse: "Payment success confirmed",
            errorCode: null
        });
        this.props.attempts.push(attempt);
        this.props.updatedAt = new Date();
        this.addDomainEvent(new PaymentConfirmed(this.id.value, this.amount));
        return Result.ok();
    }
    /**
     * Confirms execution failure.
     */
    fail(attemptId, errorCode, errorMessage) {
        if (this.status === PaymentStatus.CONFIRMED) {
            return Result.fail(ResultError.conflict("Cannot mark a confirmed payment as failed."));
        }
        this.props.status = PaymentStatus.FAILED;
        const attempt = new PaymentAttempt(attemptId, {
            timestamp: new Date(),
            status: PaymentStatus.FAILED,
            gatewayResponse: errorMessage,
            errorCode
        });
        this.props.attempts.push(attempt);
        this.props.updatedAt = new Date();
        this.addDomainEvent(new PaymentFailed(this.id.value, errorCode, errorMessage));
        return Result.ok();
    }
    /**
     * Cancels payment request.
     */
    cancel() {
        const spec = new PaymentCanBeCancelled();
        if (!spec.isSatisfiedBy(this)) {
            return Result.fail(ResultError.conflict(`Cannot cancel payment in status ${this.status}.`));
        }
        this.props.status = PaymentStatus.CANCELLED;
        this.props.updatedAt = new Date();
        this.addDomainEvent(new PaymentCancelled(this.id.value));
        return Result.ok();
    }
    /**
     * Adds an invoice allocation.
     */
    addAllocation(allocationId, invoiceId, amount) {
        const editCheck = this.ensureMutable();
        if (editCheck.isFailure)
            return Result.fail(editCheck.error);
        if (amount.currency !== this.amount.currency) {
            return Result.fail(ResultError.conflict("Allocation currency does not match payment currency."));
        }
        // Sum existing allocations
        let allocatedTotal = amount.amount;
        this.props.allocations.forEach((alloc) => {
            allocatedTotal += alloc.allocatedAmount.amount;
        });
        if (allocatedTotal > this.amount.amount) {
            return Result.fail(ResultError.conflict("Sum of allocations cannot exceed payment amount."));
        }
        const allocation = new PaymentAllocation(allocationId, {
            invoiceId,
            allocatedAmount: amount,
            status: AllocationStatus.PENDING
        });
        this.props.allocations.set(allocationId.value, allocation);
        this.props.updatedAt = new Date();
        return Result.ok();
    }
    /**
     * Initiates a refund request against the confirmed payment.
     */
    requestRefund(requestId, amount, reason) {
        if (this.status !== PaymentStatus.CONFIRMED && this.status !== PaymentStatus.REFUND_REQUESTED) {
            return Result.fail(ResultError.conflict("Refunds can only be requested on confirmed payments."));
        }
        if (amount.currency !== this.amount.currency) {
            return Result.fail(ResultError.conflict("Refund currency does not match payment currency."));
        }
        // Sum existing refund requests
        let totalRefunds = amount.amount;
        this.props.refundRequests.forEach((req) => {
            if (req.status !== RefundStatus.REJECTED) {
                totalRefunds += req.amount.amount;
            }
        });
        if (totalRefunds > this.amount.amount) {
            return Result.fail(ResultError.conflict("Refund requests total cannot exceed payment amount."));
        }
        const refund = new RefundRequest(requestId, {
            amount,
            reason,
            status: RefundStatus.REQUESTED,
            requestedAt: new Date()
        });
        this.props.refundRequests.set(requestId.value, refund);
        this.props.status = PaymentStatus.REFUND_REQUESTED;
        this.props.updatedAt = new Date();
        this.addDomainEvent(new RefundRequested(this.id.value, amount, reason));
        return Result.ok();
    }
    /**
     * Finalizes refund complete updates.
     */
    completeRefund(requestId) {
        const refund = this.props.refundRequests.get(requestId.value);
        if (!refund) {
            return Result.fail(ResultError.notFound("Refund request not found."));
        }
        if (refund.status === RefundStatus.COMPLETED)
            return Result.ok();
        refund.complete();
        // Check if sum of completed refunds equals payment amount
        let completedTotal = 0;
        this.props.refundRequests.forEach((req) => {
            if (req.status === RefundStatus.COMPLETED) {
                completedTotal += req.amount.amount;
            }
        });
        if (completedTotal >= this.amount.amount) {
            this.props.status = PaymentStatus.REFUNDED;
        }
        this.props.updatedAt = new Date();
        return Result.ok();
    }
    /**
     * Approves a requested refund.
     */
    approveRefund(requestId) {
        const refund = this.props.refundRequests.get(requestId.value);
        if (!refund) {
            return Result.fail(ResultError.notFound("Refund request not found."));
        }
        if (refund.status !== RefundStatus.REQUESTED) {
            return Result.fail(ResultError.conflict(`Cannot approve refund in status ${refund.status}.`));
        }
        refund.approve();
        this.props.updatedAt = new Date();
        return Result.ok();
    }
    /**
     * Rejects a requested refund.
     */
    rejectRefund(requestId) {
        const refund = this.props.refundRequests.get(requestId.value);
        if (!refund) {
            return Result.fail(ResultError.notFound("Refund request not found."));
        }
        if (refund.status !== RefundStatus.REQUESTED) {
            return Result.fail(ResultError.conflict(`Cannot reject refund in status ${refund.status}.`));
        }
        refund.reject();
        let activeRefunds = 0;
        this.props.refundRequests.forEach((req) => {
            if (req.status === RefundStatus.REQUESTED || req.status === RefundStatus.APPROVED || req.status === RefundStatus.COMPLETED) {
                activeRefunds++;
            }
        });
        if (activeRefunds === 0 && this.status === PaymentStatus.REFUND_REQUESTED) {
            this.props.status = PaymentStatus.CONFIRMED;
        }
        this.props.updatedAt = new Date();
        return Result.ok();
    }
}
