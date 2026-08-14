import { Payment } from "../aggregates/Payment.js";
import { PaymentId } from "../value-objects/PaymentId.js";
import { PaymentReference } from "../value-objects/PaymentReference.js";
import { TransactionHash } from "../value-objects/TransactionHash.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Domain Repository interface for Payment aggregate root operations.
 */
export interface IPaymentRepository {
  /**
   * Retrieves a Payment by its unique ID.
   */
  findById(id: PaymentId): Promise<Result<Payment>>;

  /**
   * Retrieves a Payment by its sequential reference number under an organization.
   */
  findByReference(orgId: OrganizationId, ref: PaymentReference): Promise<Result<Payment>>;

  /**
   * Retrieves a Payment by its transaction hash.
   */
  findByTransactionHash(hash: TransactionHash): Promise<Result<Payment>>;

  /**
   * Retrieves all Payments associated with a specific Invoice.
   */
  findByInvoice(orgId: OrganizationId, invoiceId: InvoiceId): Promise<Result<Payment[]>>;

  /**
   * Verifies if a blockchain transaction hash has already been registered.
   */
  existsHash(hash: TransactionHash): Promise<Result<boolean>>;

  /**
   * Saves or updates a Payment aggregate in persistence.
   */
  save(payment: Payment): Promise<Result<void>>;

  /**
   * Permanently deletes a Payment aggregate.
   */
  delete(id: PaymentId): Promise<Result<void>>;
}
