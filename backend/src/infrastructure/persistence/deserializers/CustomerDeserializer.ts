import { CustomerSnapshot } from "../snapshots/CustomerSnapshot.js";
import { CustomerProps } from "../../../business/customer/aggregates/Customer.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { CustomerNumber } from "../../../business/customer/value-objects/CustomerNumber.js";
import { CustomerName } from "../../../business/customer/value-objects/CustomerName.js";
import { CompanyName } from "../../../business/customer/value-objects/CompanyName.js";
import { CustomerStatus } from "../../../business/customer/enums/CustomerStatus.js";
import { TaxIdentifier } from "../../../business/customer/value-objects/TaxIdentifier.js";
import { PhoneNumber } from "../../../business/customer/value-objects/PhoneNumber.js";
import { Website } from "../../../business/customer/value-objects/Website.js";
import { EmailAddress } from "../../../business/customer/value-objects/EmailAddress.js";
import { AddressRecord } from "../../../business/customer/entities/AddressRecord.js";
import { Address } from "../../../business/customer/value-objects/Address.js";
import { AddressType } from "../../../business/customer/enums/AddressType.js";
import { Contact } from "../../../business/customer/entities/Contact.js";
import { CustomerNote } from "../../../business/customer/entities/CustomerNote.js";
import { UserId } from "../../../business/identity/value-objects/UserId.js";
import { CommunicationPreferences } from "../../../business/customer/value-objects/CommunicationPreferences.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Reconstructs CustomerProps domain structure from CustomerSnapshot persistence models.
 */
export class CustomerDeserializer {
  public static deserialize(snapshot: CustomerSnapshot): CustomerProps {
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
