import { AggregateRoot } from "../../../foundation/core/AggregateRoot.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

import { ReceivableAccountId } from "../value-objects/ReceivableAccountId.js";
import { OutstandingBalance } from "../value-objects/OutstandingBalance.js";
import { AgingBucket } from "../value-objects/AgingBucket.js";
import { CreditAmount } from "../value-objects/CreditAmount.js";
import { CollectionReference } from "../value-objects/CollectionReference.js";
import { WriteOffAmount } from "../value-objects/WriteOffAmount.js";
import { ReceivablePeriod } from "../value-objects/ReceivablePeriod.js";
import { AccountBalance } from "../value-objects/AccountBalance.js";
import { CollectionPriority } from "../value-objects/CollectionPriority.js";
import { CreditReason } from "../value-objects/CreditReason.js";

import { ReceivableEntry } from "../entities/ReceivableEntry.js";
import { PaymentApplication } from "../entities/PaymentApplication.js";
import { CustomerCredit } from "../entities/CustomerCredit.js";
import { CollectionAction } from "../entities/CollectionAction.js";

import { ReceivableStatus } from "../enums/ReceivableStatus.js";
import { AgingCategory } from "../enums/AgingCategory.js";
import { CollectionStatus } from "../enums/CollectionStatus.js";
import { CreditSource } from "../enums/CreditSource.js";

import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { CustomerId } from "../../customer/value-objects/CustomerId.js";
import { SettlementId } from "../../settlement/value-objects/SettlementId.js";
import { InvoiceId } from "../../invoice/value-objects/InvoiceId.js";
import { UserId } from "../../identity/value-objects/UserId.js";
import { Money } from "../../invoice/value-objects/Money.js";

import { ReceivableCreated } from "../events/ReceivableCreated.js";
import { OutstandingBalanceUpdated } from "../events/OutstandingBalanceUpdated.js";
import { PaymentApplied } from "../events/PaymentApplied.js";
import { CustomerCreditCreated } from "../events/CustomerCreditCreated.js";
import { CustomerCreditApplied } from "../events/CustomerCreditApplied.js";
import { InvoiceOverdue } from "../events/InvoiceOverdue.js";
import { CollectionStarted } from "../events/CollectionStarted.js";
import { ReceivableWrittenOff } from "../events/ReceivableWrittenOff.js";
import { ReceivableClosed } from "../events/ReceivableClosed.js";
import { AccountBalanceUpdated } from "../events/AccountBalanceUpdated.js";

import { CreditAllocationPolicy } from "../services/CreditAllocationPolicy.js";
import { ReceivablePolicy } from "../services/ReceivablePolicy.js";

export interface AccountsReceivableProps {
  organizationId: OrganizationId;
  customerId: CustomerId;
  status: ReceivableStatus;
  collectionStatus: CollectionStatus;
  entries: Map<string, ReceivableEntry>;
  paymentApplications: PaymentApplication[];
  customerCredits: CustomerCredit[];
  collectionActions: CollectionAction[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate Root representing the financial and collection state of a customer.
 */
export class AccountsReceivable extends AggregateRoot<ReceivableAccountId> {
  private readonly props: AccountsReceivableProps;

  private constructor(id: ReceivableAccountId, props: AccountsReceivableProps) {
    super(id);
    this.props = props;
  }

  /**
   * Factory constructor to initialize an AccountsReceivable account.
   */
  public static create(
    id: ReceivableAccountId,
    organizationId: OrganizationId,
    customerId: CustomerId,
    optional?: {
      status?: ReceivableStatus;
      collectionStatus?: CollectionStatus;
      entries?: Map<string, ReceivableEntry>;
      paymentApplications?: PaymentApplication[];
      customerCredits?: CustomerCredit[];
      collectionActions?: CollectionAction[];
      createdAt?: Date;
      updatedAt?: Date;
    }
  ): Result<AccountsReceivable> {
    const ar = new AccountsReceivable(id, {
      organizationId,
      customerId,
      status: optional?.status || ReceivableStatus.CURRENT,
      collectionStatus: optional?.collectionStatus || CollectionStatus.NONE,
      entries: optional?.entries || new Map(),
      paymentApplications: optional?.paymentApplications || [],
      customerCredits: optional?.customerCredits || [],
      collectionActions: optional?.collectionActions || [],
      createdAt: optional?.createdAt || new Date(),
      updatedAt: optional?.updatedAt || new Date()
    });

    ar.addDomainEvent(new ReceivableCreated(id.value, organizationId, customerId));
    return Result.ok(ar);
  }

  // Getters
  public get organizationId(): OrganizationId { return this.props.organizationId; }
  public get customerId(): CustomerId { return this.props.customerId; }
  public get status(): ReceivableStatus { return this.props.status; }
  public get collectionStatus(): CollectionStatus { return this.props.collectionStatus; }
  public get entries(): readonly ReceivableEntry[] { return Object.freeze(Array.from(this.props.entries.values())); }
  public get paymentApplications(): readonly PaymentApplication[] { return Object.freeze([...this.props.paymentApplications]); }
  public get customerCredits(): readonly CustomerCredit[] { return Object.freeze([...this.props.customerCredits]); }
  public get collectionActions(): readonly CollectionAction[] { return Object.freeze([...this.props.collectionActions]); }
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }

  /**
   * Helper to sum outstanding balance for a specific currency.
   */
  public getOutstandingBalance(currency: string): OutstandingBalance {
    let total = 0;
    this.props.entries.forEach((entry) => {
      if (entry.remainingBalance.currency === currency) {
        total += entry.remainingBalance.amount;
      }
    });
    return OutstandingBalance.create(Money.create(total, currency).value).value;
  }

  /**
   * Helper to sum unapplied credit balance for a specific currency.
   */
  public getCreditBalance(currency: string): CreditAmount {
    let total = 0;
    this.props.customerCredits.forEach((credit) => {
      if (credit.remainingBalance.currency === currency) {
        total += credit.remainingBalance.amount;
      }
    });
    return CreditAmount.create(Money.create(total, currency).value).value;
  }

  /**
   * Helper to calculate the AccountBalance for a specific currency.
   */
  public getAccountBalance(currency: string): AccountBalance {
    return AccountBalance.create(
      this.getOutstandingBalance(currency),
      this.getCreditBalance(currency),
      currency
    ).value;
  }

  private ensureMutable(): Result<void> {
    if (this.status === ReceivableStatus.CLOSED) {
      return Result.fail(
        ResultError.conflict("Closed receivable accounts are immutable. Reopen first to mutate.")
      );
    }
    return Result.ok();
  }

  /**
   * Registers a new invoice debt entry.
   */
  public addInvoice(
    entryId: UniqueEntityID,
    invoiceId: InvoiceId,
    amount: Money,
    dueDate: Date
  ): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    if (this.props.entries.has(invoiceId.value)) {
      return Result.fail(
        ResultError.conflict(`Invoice '${invoiceId.value}' is already registered on this AR account.`)
      );
    }

    const entry = new ReceivableEntry(entryId, {
      invoiceId,
      originalAmount: amount,
      remainingBalance: amount,
      dueDate
    });

    this.props.entries.set(invoiceId.value, entry);
    this.props.updatedAt = new Date();

    const currentBalance = this.getOutstandingBalance(amount.currency);
    this.addDomainEvent(new OutstandingBalanceUpdated(this.id.value, currentBalance));
    this.addDomainEvent(new AccountBalanceUpdated(this.id.value, this.getAccountBalance(amount.currency)));

    return Result.ok();
  }

  /**
   * Applies settled payment funds against invoices.
   * If the payment exceeds the outstanding balance, the excess is saved as a CustomerCredit (Overpayment).
   */
  public applyPayment(
    applicationId: UniqueEntityID,
    settlementId: SettlementId,
    invoiceId: InvoiceId,
    amount: Money,
    creditAllocationPolicy: CreditAllocationPolicy
  ): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    const entry = this.props.entries.get(invoiceId.value);
    if (!entry) {
      // Overpayment: create a customer credit
      const creditId = new UniqueEntityID();
      const credit = new CustomerCredit(creditId, {
        source: CreditSource.OVERPAYMENT,
        amount,
        remainingBalance: amount,
        reason: CreditReason.create(`Payment applied to unregistered invoice obligation: ${invoiceId.value}`).value,
        createdAt: new Date()
      });
      this.props.customerCredits.push(credit);
      this.props.updatedAt = new Date();

      const creditAmt = CreditAmount.create(amount).value;
      this.addDomainEvent(new CustomerCreditCreated(this.id.value, CreditSource.OVERPAYMENT, creditAmt));
      this.addDomainEvent(new AccountBalanceUpdated(this.id.value, this.getAccountBalance(amount.currency)));
      return Result.ok();
    }

    if (entry.isPaid) {
      // Already paid, treat full amount as overpayment credit
      const creditId = new UniqueEntityID();
      const credit = new CustomerCredit(creditId, {
        source: CreditSource.OVERPAYMENT,
        amount,
        remainingBalance: amount,
        reason: CreditReason.create(`Overpayment credit for already paid invoice: ${invoiceId.value}`).value,
        createdAt: new Date()
      });
      this.props.customerCredits.push(credit);
      this.props.updatedAt = new Date();

      const creditAmt = CreditAmount.create(amount).value;
      this.addDomainEvent(new CustomerCreditCreated(this.id.value, CreditSource.OVERPAYMENT, creditAmt));
      this.addDomainEvent(new AccountBalanceUpdated(this.id.value, this.getAccountBalance(amount.currency)));
      return Result.ok();
    }

    const excess = entry.applyPayment(amount);
    const appliedAmount = Money.create(amount.amount - excess.amount, amount.currency).value;

    const application = new PaymentApplication(applicationId, {
      settlementId,
      invoiceId,
      appliedAmount,
      appliedAt: new Date()
    });
    this.props.paymentApplications.push(application);
    this.addDomainEvent(new PaymentApplied(this.id.value, settlementId, invoiceId, appliedAmount));

    if (excess.amount > 0) {
      const creditId = new UniqueEntityID();
      const credit = new CustomerCredit(creditId, {
        source: CreditSource.OVERPAYMENT,
        amount: excess,
        remainingBalance: excess,
        reason: CreditReason.create(`Overpayment credit from payment application on invoice: ${invoiceId.value}`).value,
        createdAt: new Date()
      });
      this.props.customerCredits.push(credit);
      const creditAmt = CreditAmount.create(excess).value;
      this.addDomainEvent(new CustomerCreditCreated(this.id.value, CreditSource.OVERPAYMENT, creditAmt));
    }

    // Update status if appropriate
    let hasOverdue = false;
    this.props.entries.forEach((e) => {
      if (!e.isPaid && e.dueDate < new Date()) {
        hasOverdue = true;
      }
    });

    if (hasOverdue) {
      this.props.status = ReceivableStatus.OVERDUE;
    } else {
      // Check if there are any remaining outstanding balances
      let totalDebt = 0;
      this.props.entries.forEach(e => totalDebt += e.remainingBalance.amount);
      if (totalDebt > 0) {
        this.props.status = ReceivableStatus.PARTIALLY_PAID;
      } else {
        this.props.status = ReceivableStatus.CURRENT;
      }
    }

    this.props.updatedAt = new Date();

    const currentBalance = this.getOutstandingBalance(amount.currency);
    this.addDomainEvent(new OutstandingBalanceUpdated(this.id.value, currentBalance));
    this.addDomainEvent(new AccountBalanceUpdated(this.id.value, this.getAccountBalance(amount.currency)));

    return Result.ok();
  }

  /**
   * Applies unapplied customer credit to pay off an invoice.
   */
  public applyCredit(
    creditId: UniqueEntityID,
    invoiceId: InvoiceId,
    amount: Money
  ): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    const credit = this.props.customerCredits.find((c) => c.id.equals(creditId));
    if (!credit) {
      return Result.fail(ResultError.notFound(`Customer credit '${creditId.value}' not found.`));
    }

    const entry = this.props.entries.get(invoiceId.value);
    if (!entry) {
      return Result.fail(ResultError.notFound(`Invoice entry '${invoiceId.value}' not found.`));
    }

    if (credit.remainingBalance.currency !== amount.currency || entry.remainingBalance.currency !== amount.currency) {
      return Result.fail(ResultError.conflict("Currency mismatch in credit application."));
    }

    if (credit.remainingBalance.amount < amount.amount) {
      return Result.fail(ResultError.conflict(`Insufficient credit balance. Available: ${credit.remainingBalance.amount}.`));
    }

    if (entry.remainingBalance.amount < amount.amount) {
      return Result.fail(ResultError.conflict(`Applied credit amount exceeds invoice remaining balance: ${entry.remainingBalance.amount}.`));
    }

    credit.consume(amount);
    entry.applyPayment(amount);

    this.props.updatedAt = new Date();
    this.addDomainEvent(new CustomerCreditApplied(this.id.value, invoiceId, amount));
    this.addDomainEvent(new OutstandingBalanceUpdated(this.id.value, this.getOutstandingBalance(amount.currency)));
    this.addDomainEvent(new AccountBalanceUpdated(this.id.value, this.getAccountBalance(amount.currency)));

    return Result.ok();
  }

  /**
   * Forgives part or all of the outstanding balances.
   */
  public writeOff(
    amount: Money,
    approvedBy: UserId,
    receivablePolicy: ReceivablePolicy
  ): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    const outstanding = this.getOutstandingBalance(amount.currency);
    if (amount.amount > outstanding.amount) {
      return Result.fail(
        ResultError.conflict(`Write-off amount (${amount.amount}) cannot exceed outstanding debt (${outstanding.amount}).`)
      );
    }

    const policyCheck = receivablePolicy.validateWriteOffPermissions(this, amount, approvedBy);
    if (policyCheck.isFailure) return Result.fail(policyCheck.error);

    // Distribute write-off across unpaid entries
    let remainingToWriteOff = amount.amount;
    for (const entry of Array.from(this.props.entries.values())) {
      if (entry.isPaid || entry.remainingBalance.currency !== amount.currency) continue;
      
      const toWriteOff = Math.min(entry.remainingBalance.amount, remainingToWriteOff);
      if (toWriteOff > 0) {
        entry.writeOff(Money.create(toWriteOff, amount.currency).value);
        remainingToWriteOff -= toWriteOff;
      }
      if (remainingToWriteOff <= 0) break;
    }

    this.props.status = ReceivableStatus.WRITTEN_OFF;
    this.props.updatedAt = new Date();

    const writeOffVO = WriteOffAmount.create(amount).value;
    this.addDomainEvent(new ReceivableWrittenOff(this.id.value, writeOffVO, approvedBy));
    this.addDomainEvent(new OutstandingBalanceUpdated(this.id.value, this.getOutstandingBalance(amount.currency)));
    this.addDomainEvent(new AccountBalanceUpdated(this.id.value, this.getAccountBalance(amount.currency)));

    return Result.ok();
  }

  /**
   * Flags an entry as overdue.
   */
  public triggerOverdue(invoiceId: InvoiceId): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    const entry = this.props.entries.get(invoiceId.value);
    if (!entry) {
      return Result.fail(ResultError.notFound(`Invoice entry '${invoiceId.value}' not found.`));
    }
    if (entry.isPaid) {
      return Result.fail(ResultError.conflict(`Cannot mark fully paid invoice '${invoiceId.value}' as overdue.`));
    }

    this.props.status = ReceivableStatus.OVERDUE;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new InvoiceOverdue(this.id.value, invoiceId));
    return Result.ok();
  }

  /**
   * Initiates collections procedure.
   */
  public startCollection(reason: string, priority: CollectionPriority): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    this.props.status = ReceivableStatus.IN_COLLECTIONS;
    this.props.collectionStatus = CollectionStatus.REMINDER_SENT;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new CollectionStarted(this.id.value, reason, priority.value));
    return Result.ok();
  }

  /**
   * Logs a collections escalation or reminder action.
   */
  public logCollectionAction(
    actionId: UniqueEntityID,
    actionType: string,
    notes: string,
    performedBy: UserId
  ): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    const action = new CollectionAction(actionId, {
      actionType,
      notes,
      performedBy,
      timestamp: new Date()
    });
    this.props.collectionActions.push(action);
    this.props.updatedAt = new Date();

    return Result.ok();
  }

  /**
   * Closes a paid-off AR account.
   */
  public close(receivablePolicy: ReceivablePolicy): Result<void> {
    const editCheck = this.ensureMutable();
    if (editCheck.isFailure) return Result.fail(editCheck.error);

    const policyCheck = receivablePolicy.validateAccountClosure(this);
    if (policyCheck.isFailure) return Result.fail(policyCheck.error);

    this.props.status = ReceivableStatus.CLOSED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new ReceivableClosed(this.id.value));
    return Result.ok();
  }

  /**
   * Reopens a closed AR account.
   */
  public reopen(receivablePolicy: ReceivablePolicy): Result<void> {
    if (this.status !== ReceivableStatus.CLOSED) {
      return Result.fail(ResultError.conflict("Only closed AR accounts can be reopened."));
    }

    const policyCheck = receivablePolicy.validateAccountReopening(this);
    if (policyCheck.isFailure) return Result.fail(policyCheck.error);

    this.props.status = ReceivableStatus.CURRENT;
    this.props.updatedAt = new Date();

    return Result.ok();
  }
}
