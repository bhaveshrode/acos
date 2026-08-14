import { AggregateRoot } from "../../../foundation/core/AggregateRoot.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { CommunicationPreferences } from "../value-objects/CommunicationPreferences.js";
// Entities
import { Contact } from "../entities/Contact.js";
import { AddressRecord } from "../entities/AddressRecord.js";
import { CustomerNote } from "../entities/CustomerNote.js";
// Enums
import { CustomerStatus } from "../enums/CustomerStatus.js";
import { AddressType } from "../enums/AddressType.js";
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
/**
 * Aggregate Root guarding Customer contact details, tax identifiers, billing addresses, and status lifecycle.
 */
export class Customer extends AggregateRoot {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    /**
     * Factory method to create a Customer in memory.
     * Guarantees aggregates start with at least one primary contact person and one billing address.
     */
    static create(id, organizationId, customerNumber, name, initialContact, initialBillingAddress, optional) {
        const contacts = new Map();
        const addresses = new Map();
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
    get organizationId() { return this.props.organizationId; }
    get customerNumber() { return this.props.customerNumber; }
    get name() { return this.props.name; }
    get companyName() { return this.props.companyName; }
    get status() { return this.props.status; }
    get taxIdentifier() { return this.props.taxIdentifier; }
    get phoneNumber() { return this.props.phoneNumber; }
    get website() { return this.props.website; }
    get email() { return this.props.email; }
    get addresses() { return Object.freeze(Array.from(this.props.addresses.values())); }
    get contacts() { return Object.freeze(Array.from(this.props.contacts.values())); }
    get notes() { return Object.freeze(Array.from(this.props.notes.values())); }
    get communicationPreferences() { return this.props.communicationPreferences; }
    get createdAt() { return this.props.createdAt; }
    get updatedAt() { return this.props.updatedAt; }
    ensureNotArchivedOrDeleted() {
        if (this.status === CustomerStatus.ARCHIVED) {
            return Result.fail(ResultError.conflict("Archived customers cannot be modified."));
        }
        return Result.ok();
    }
    /**
     * Adds a new contact representative.
     */
    addContact(contactId, name, email, phone, isPrimary = false) {
        const checkStatus = this.ensureNotArchivedOrDeleted();
        if (checkStatus.isFailure)
            return Result.fail(checkStatus.error);
        // Enforce email uniqueness check within contacts map
        for (const c of this.props.contacts.values()) {
            if (c.email.equals(email)) {
                return Result.fail(ResultError.conflict(`Contact with email '${email.value}' already exists for this customer.`));
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
    setPrimaryContact(contactId) {
        const checkStatus = this.ensureNotArchivedOrDeleted();
        if (checkStatus.isFailure)
            return Result.fail(checkStatus.error);
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
    addOrUpdateAddress(addressId, address, type) {
        const checkStatus = this.ensureNotArchivedOrDeleted();
        if (checkStatus.isFailure)
            return Result.fail(checkStatus.error);
        let record = this.props.addresses.get(addressId.value);
        if (record) {
            record.updateAddress(address);
            record.updateType(type);
        }
        else {
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
    removeAddress(addressId) {
        const checkStatus = this.ensureNotArchivedOrDeleted();
        if (checkStatus.isFailure)
            return Result.fail(checkStatus.error);
        const target = this.props.addresses.get(addressId.value);
        if (!target) {
            return Result.fail(ResultError.notFound("Address not found."));
        }
        if (target.type === AddressType.BILLING) {
            let billingCount = 0;
            this.props.addresses.forEach((addr) => {
                if (addr.type === AddressType.BILLING)
                    billingCount++;
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
    updateTaxIdentifier(taxIdentifier) {
        const checkStatus = this.ensureNotArchivedOrDeleted();
        if (checkStatus.isFailure)
            return Result.fail(checkStatus.error);
        this.props.taxIdentifier = taxIdentifier;
        this.props.updatedAt = new Date();
        this.addDomainEvent(new TaxInformationUpdated(this.id.value, taxIdentifier));
        return Result.ok();
    }
    /**
     * Swaps communication channel options.
     */
    updateCommunicationPreferences(preferences) {
        const checkStatus = this.ensureNotArchivedOrDeleted();
        if (checkStatus.isFailure)
            return Result.fail(checkStatus.error);
        this.props.communicationPreferences = preferences;
        this.props.updatedAt = new Date();
        this.addDomainEvent(new CommunicationPreferencesChanged(this.id.value, preferences));
        return Result.ok();
    }
    /**
     * Logs an internal note about this customer relation.
     */
    addNote(noteId, content, createdBy) {
        const checkStatus = this.ensureNotArchivedOrDeleted();
        if (checkStatus.isFailure)
            return Result.fail(checkStatus.error);
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
    activate() {
        if (this.status === CustomerStatus.ACTIVE)
            return Result.ok();
        this.props.status = CustomerStatus.ACTIVE;
        this.props.updatedAt = new Date();
        this.addDomainEvent(new CustomerActivated(this.id.value));
        return Result.ok();
    }
    /**
     * Administratively blocks future billing actions.
     */
    block(reason) {
        if (this.status === CustomerStatus.BLOCKED)
            return Result.ok();
        this.props.status = CustomerStatus.BLOCKED;
        this.props.updatedAt = new Date();
        this.addDomainEvent(new CustomerBlocked(this.id.value, reason));
        return Result.ok();
    }
    /**
     * Archives profile, locking all mutations.
     */
    archive() {
        if (this.status === CustomerStatus.ARCHIVED)
            return Result.ok();
        this.props.status = CustomerStatus.ARCHIVED;
        this.props.updatedAt = new Date();
        this.addDomainEvent(new CustomerArchived(this.id.value));
        return Result.ok();
    }
    /**
     * Soft-deletes the customer.
     */
    delete() {
        this.props.status = CustomerStatus.ARCHIVED; // Archives as fallback terminal state
        this.props.updatedAt = new Date();
        this.addDomainEvent(new CustomerDeleted(this.id.value));
        return Result.ok();
    }
}
