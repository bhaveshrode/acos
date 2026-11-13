import { CustomerSnapshot } from "../snapshots/CustomerSnapshot.js";
import {
  OrganizationId,
  CustomerNumber,
  CustomerName,
  CompanyName,
  CustomerStatus,
  TaxIdentifier,
  PhoneNumber,
  Website,
  EmailAddress,
  AddressRecord,
  Address,
  AddressType,
  Contact,
  CustomerNote,
  UserId,
  CommunicationPreferences,
  UniqueEntityID
} from "acos-backend";

/**
 * Rebuilds the aggregate state from a persisted snapshot.
 */
export class CustomerDeserializer {
  public static deserialize(snapshot: CustomerSnapshot) {
    const addresses = new Map<string, AddressRecord>();
    for (const addr of snapshot.addresses) {
      const addressVal = Address.create(
        addr.line1,
        addr.city,
        addr.state,
        addr.country,
        addr.postalCode,
        addr.line2 || undefined
      ).value;
      addresses.set(
        addr.id,
        new AddressRecord(new UniqueEntityID(addr.id), {
          address: addressVal,
          type: addr.type as AddressType
        })
      );
    }

    const contacts = new Map<string, Contact>();
    for (const c of snapshot.contacts) {
      contacts.set(
        c.id,
        new Contact(new UniqueEntityID(c.id), {
          name: c.name,
          email: EmailAddress.create(c.email).value,
          phone: c.phone ? PhoneNumber.create(c.phone).value : undefined,
          isPrimary: c.isPrimary
        })
      );
    }

    const notes = new Map<string, CustomerNote>();
    for (const n of snapshot.notes) {
      notes.set(
        n.id,
        new CustomerNote(new UniqueEntityID(n.id), {
          content: n.content,
          createdBy: new UserId(n.authorId),
          createdAt: n.createdAt
        })
      );
    }

    return {
      organizationId: new OrganizationId(snapshot.organizationId),
      customerNumber: CustomerNumber.create(snapshot.customerNumber).value,
      name: CustomerName.create(snapshot.name).value,
      companyName: snapshot.companyName ? CompanyName.create(snapshot.companyName).value : null,
      status: snapshot.status as CustomerStatus,
      taxIdentifier: snapshot.taxIdentifier ? TaxIdentifier.create(snapshot.taxIdentifier).value : null,
      phoneNumber: snapshot.phoneNumber ? PhoneNumber.create(snapshot.phoneNumber).value : null,
      website: snapshot.website ? Website.create(snapshot.website).value : null,
      email: snapshot.email ? EmailAddress.create(snapshot.email).value : null,
      addresses,
      contacts,
      notes,
      communicationPreferences: CommunicationPreferences.create(
        snapshot.communicationPreferences.emailEnabled,
        snapshot.communicationPreferences.smsEnabled,
        snapshot.communicationPreferences.pushEnabled
      ).value,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt
    };
  }
}
