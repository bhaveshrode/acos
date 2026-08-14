import { Settlement } from "../aggregates/Settlement.js";
import { SettlementId } from "../value-objects/SettlementId.js";
import { SettlementReference } from "../value-objects/SettlementReference.js";
import { TransactionHash } from "../value-objects/TransactionHash.js";
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { PaymentId } from "../../payment/value-objects/PaymentId.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Domain Repository interface for Settlement aggregate root operations.
 */
export interface ISettlementRepository {
  /**
   * Retrieves a Settlement by its unique ID.
   */
  findById(id: SettlementId): Promise<Result<Settlement>>;

  /**
   * Retrieves a Settlement by its sequential reference number under an organization.
   */
  findByReference(orgId: OrganizationId, ref: SettlementReference): Promise<Result<Settlement>>;

  /**
   * Retrieves a Settlement by its associated payment.
   */
  findByPayment(orgId: OrganizationId, paymentId: PaymentId): Promise<Result<Settlement>>;

  /**
   * Retrieves a Settlement by its blockchain transaction hash.
   */
  findByTransactionHash(hash: TransactionHash): Promise<Result<Settlement>>;

  /**
   * Saves or updates a Settlement aggregate in persistence.
   */
  save(settlement: Settlement): Promise<Result<void>>;

  /**
   * Permanently deletes a Settlement aggregate.
   */
  delete(id: SettlementId): Promise<Result<void>>;
}
