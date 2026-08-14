import { AggregateRoot } from "../../../foundation/core/AggregateRoot.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

// Value Objects
import { CustomerId } from "../value-objects/CustomerId.js";
import { CustomerNumber } from "../value-objects/CustomerNumber.js";
import { CustomerName } from "../value-objects/CustomerName.js";
import { CompanyName } from "../value-objects/CompanyName.js";
import { TaxIdentifier } from "../value-objects/TaxIdentifier.js";
import { PhoneNumber } from "../value-objects/PhoneNumber.js";
import { Website } from "../value-objects/Website.js";
import { EmailAddress } from "../value-objects/EmailAddress.js";
import { Address } from "../value-objects/Address.js";
import { CommunicationPreferences } from "../value-objects/CommunicationPreferences.js";

// Entities
import { Contact } from "../entities/Contact.js";
import { AddressRecord } from "../entities/AddressRecord.js";
import { CustomerNote } from "../entities/CustomerNote.js";

// Enums
import { CustomerStatus } from "../enums/CustomerStatus.js";
import { AddressType } from "../enums/AddressType.js";

// References
import { OrganizationId } from "../../organization/value-objects/OrganizationId.js";
import { UserId } from "../../identity/value-objects/UserId.js";

// Domain Events
import { CustomerCreated } from "../events/CustomerCreated.js";
import { CustomerActivated } from "../events/CustomerActivated.js";
import { CustomerArchived } from "../events/CustomerArchived.js";
import { CustomerDeleted } from "../events/CustomerDeleted.js";
import { CustomerBlocked } from "../events/CustomerBlocked.js";
import { ContactAdded } from "../events/ContactAdded.js";
import { PrimaryContactChanged } from "../events/PrimaryContactChanged.js";
import { BillingAddressChanged } from "../events/BillingAddressChanged.js";
import { TaxInformationUpdated } from "../events/TaxInformationUpdated.js";
import { CommunicationPreferencesChanged } from "../events/CommunicationPreferencesChanged.js";

export interface CustomerProps {
  organizationId: OrganizationId;
  customerNumber: CustomerNumber;
  name: CustomerName;
  companyName: CompanyName | null;
  status: CustomerStatus;
  taxIdentifier: TaxIdentifier | null;
  phoneNumber: PhoneNumber | null;
  website: Website | null;
  email: EmailAddress | null;
  addresses: Map<string, AddressRecord>;
  contacts: Map<string, Contact>;
  notes: Map<string, CustomerNote>;
  communicationPreferences: CommunicationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate Root guarding Customer contact details, tax identifiers, billing addresses, and status lifecycle.
 */
export class Customer extends AggregateRoot<CustomerId> {
  private readonly props: CustomerProps;

  private constructor(id: CustomerId, props: CustomerProps) {
    super(id);
    this.props = props;
  }

  /**
   * Factory method to create a Customer in memory.
   * Guarantees aggregates start with at least one primary contact person and one billing address.
   */
  public static create(
    id: CustomerId,
    organizationId: OrganizationId,
    customerNumber: CustomerNumber,
    name: CustomerName,
    initialContact: { id: UniqueEntityID; name: string; email: EmailAddress; phone?: PhoneNumber },
    initialBillingAddress: Address,
    optional?: {
      companyName?: CompanyName;
      taxIdentifier?: TaxIdentifier;
      phoneNumber?: PhoneNumber;
      website?: Website;
      email?: EmailAddress;
      communicationPreferences?: CommunicationPreferences;
      createdAt?: Date;
      updatedAt?: Date;
    }
  ): Result<Customer> {
    const contacts = new Map<string, Contact>();
    const addresses = new Map<string, AddressRecord>();

    // Invariant: At least one primary contact
    const contact = new Contact(initialContact.id, {
      name: initialContact.name,
      email: initialContact.email,
      phone: initialContact.phone,
      isPrimary: true
    });
    contacts.set(initialContact.id.value, contact);

    // Invariant: At least one billing address
    const addressId = new UniqueEntityID();
    const billingAddressRecord = new AddressRecord(addressId, {
      address: initialBillingAddress,
      type: AddressType.BILLING
    });
    addresses.set(addressId.value, billingAddressRecord);

    const customer = new Customer(id, {
      organizationId,
      customerNumber,
      name,
      companyName: optional?.companyName || null,
      status: CustomerStatus.ACTIVE,
      taxIdentifier: optional?.taxIdentifier || null,
      phoneNumber: optional?.phoneNumber || null,
      website: optional?.website || null,
      email: optional?.email || null,
      addresses,
      contacts,
      notes: new Map(),
      communicationPreferences: optional?.communicationPreferences || CommunicationPreferences.create().value,
      createdAt: optional?.createdAt || new Date(),
      updatedAt: optional?.updatedAt || new Date()
    });

    customer.addDomainEvent(new CustomerCreated(id.value, organizationId, customerNumber));
    return Result.ok(customer);
  }

  // Getters
  public get organizationId(): OrganizationId { return this.props.organizationId; }
  public get customerNumber(): CustomerNumber { return this.props.customerNumber; }
  public get name(): CustomerName { return this.props.name; }
  public get companyName(): CompanyName | null { return this.props.companyName; }
  public get status(): CustomerStatus { return this.props.status; }
  public get taxIdentifier(): TaxIdentifier | null { return this.props.taxIdentifier; }
  public get phoneNumber(): PhoneNumber | null { return this.props.phoneNumber; }
  public get website(): Website | null { return this.props.website; }
  public get email(): EmailAddress | null { return this.props.email; }
  public get addresses(): readonly AddressRecord[] { return Object.freeze(Array.from(this.props.addresses.values())); }
  public get contacts(): readonly Contact[] { return Object.freeze(Array.from(this.props.contacts.values())); }
  public get notes(): readonly CustomerNote[] { return Object.freeze(Array.from(this.props.notes.values())); }
  public get communicationPreferences(): CommunicationPreferences { return this.props.communicationPreferences; }
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }

  private ensureNotArchivedOrDeleted(): Result<void> {
    if (this.status === CustomerStatus.ARCHIVED) {
      return Result.fail(ResultError.conflict("Archived customers cannot be modified."));
    }
    return Result.ok();
  }

  /**
   * Adds a new contact representative.
   */
  public addContact(
    contactId: UniqueEntityID,
    name: string,
    email: EmailAddress,
    phone?: PhoneNumber,
    isPrimary: boolean = false
  ): Result<void> {
    const checkStatus = this.ensureNotArchivedOrDeleted();
    if (checkStatus.isFailure) return Result.fail(checkStatus.error);

    // Enforce email uniqueness check within contacts map
    for (const c of this.props.contacts.values()) {
      if (c.email.equals(email)) {
        return Result.fail(
          ResultError.conflict(`Contact with email '${email.value}' already exists for this customer.`)
        );
      }
    }

    const contact = new Contact(contactId, {
      name,
      email,
      phone,
      isPrimary: false
    });

    this.props.contacts.set(contactId.value, contact);

    if (isPrimary) {
      this.setPrimaryContact(contactId);
    }

    this.props.updatedAt = new Date();
    this.addDomainEvent(new ContactAdded(this.id.value, contactId));
    return Result.ok();
  }

  /**
   * Designates a contact person as the primary contact.
   */
  public setPrimaryContact(contactId: UniqueEntityID): Result<void> {
    const checkStatus = this.ensureNotArchivedOrDeleted();
    if (checkStatus.isFailure) return Result.fail(checkStatus.error);

    const target = this.props.contacts.get(contactId.value);
    if (!target) {
      return Result.fail(ResultError.notFound("Contact not found."));
    }

    this.props.contacts.forEach((c) => c.setPrimary(false));
    target.setPrimary(true);

    this.props.updatedAt = new Date();
    this.addDomainEvent(new PrimaryContactChanged(this.id.value, contactId));
    return Result.ok();
  }

  /**
   * Registers or updates a shipping or billing address.
   */
  public addOrUpdateAddress(
    addressId: UniqueEntityID,
    address: Address,
    type: AddressType
  ): Result<void> {
    const checkStatus = this.ensureNotArchivedOrDeleted();
    if (checkStatus.isFailure) return Result.fail(checkStatus.error);

    let record = this.props.addresses.get(addressId.value);
    if (record) {
      record.updateAddress(address);
      record.updateType(type);
    } else {
      record = new AddressRecord(addressId, { address, type });
      this.props.addresses.set(addressId.value, record);
    }

    this.props.updatedAt = new Date();
    if (type === AddressType.BILLING) {
      this.addDomainEvent(new BillingAddressChanged(this.id.value, address));
    }
    return Result.ok();
  }

  /**
   * Removes an address. Restricts removal if it would violate the minimum billing address invariant.
   */
  public removeAddress(addressId: UniqueEntityID): Result<void> {
    const checkStatus = this.ensureNotArchivedOrDeleted();
    if (checkStatus.isFailure) return Result.fail(checkStatus.error);

    const target = this.props.addresses.get(addressId.value);
    if (!target) {
      return Result.fail(ResultError.notFound("Address not found."));
    }

    if (target.type === AddressType.BILLING) {
      let billingCount = 0;
      this.props.addresses.forEach((addr) => {
        if (addr.type === AddressType.BILLING) billingCount++;
      });
      if (billingCount <= 1) {
        return Result.fail(ResultError.conflict("Customer must have at least one billing address."));
      }
    }

    this.props.addresses.delete(addressId.value);
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  /**
   * Updates customer tax identifiers.
   */
  public updateTaxIdentifier(taxIdentifier: TaxIdentifier | null): Result<void> {
    const checkStatus = this.ensureNotArchivedOrDeleted();
    if (checkStatus.isFailure) return Result.fail(checkStatus.error);

    this.props.taxIdentifier = taxIdentifier;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new TaxInformationUpdated(this.id.value, taxIdentifier));
    return Result.ok();
  }

  /**
   * Swaps communication channel options.
   */
  public updateCommunicationPreferences(preferences: CommunicationPreferences): Result<void> {
    const checkStatus = this.ensureNotArchivedOrDeleted();
    if (checkStatus.isFailure) return Result.fail(checkStatus.error);

    this.props.communicationPreferences = preferences;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new CommunicationPreferencesChanged(this.id.value, preferences));
    return Result.ok();
  }

  /**
   * Logs an internal note about this customer relation.
   */
  public addNote(noteId: UniqueEntityID, content: string, createdBy: UserId): Result<void> {
    const checkStatus = this.ensureNotArchivedOrDeleted();
    if (checkStatus.isFailure) return Result.fail(checkStatus.error);

    if (!content || content.trim() === "") {
      return Result.fail(ResultError.validation("Note content cannot be empty."));
    }

    const note = new CustomerNote(noteId, {
      content: content.trim(),
      createdBy,
      createdAt: new Date()
    });
    this.props.notes.set(noteId.value, note);
    this.props.updatedAt = new Date();
    return Result.ok();
  }

  /**
   * Customer status activator.
   */
  public activate(): Result<void> {
    if (this.status === CustomerStatus.ACTIVE) return Result.ok();
    this.props.status = CustomerStatus.ACTIVE;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new CustomerActivated(this.id.value));
    return Result.ok();
  }

  /**
   * Administratively blocks future billing actions.
   */
  public block(reason: string): Result<void> {
    if (this.status === CustomerStatus.BLOCKED) return Result.ok();
    this.props.status = CustomerStatus.BLOCKED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new CustomerBlocked(this.id.value, reason));
    return Result.ok();
  }

  /**
   * Archives profile, locking all mutations.
   */
  public archive(): Result<void> {
    if (this.status === CustomerStatus.ARCHIVED) return Result.ok();
    this.props.status = CustomerStatus.ARCHIVED;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new CustomerArchived(this.id.value));
    return Result.ok();
  }

  /**
   * Soft-deletes the customer.
   */
  public delete(): Result<void> {
    this.props.status = CustomerStatus.ARCHIVED; // Archives as fallback terminal state
    this.props.updatedAt = new Date();

    this.addDomainEvent(new CustomerDeleted(this.id.value));
    return Result.ok();
  }
}
