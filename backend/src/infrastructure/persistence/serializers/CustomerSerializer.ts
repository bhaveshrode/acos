import { Customer } from "../../../business/customer/aggregates/Customer.js";
import { CustomerSnapshot } from "../snapshots/CustomerSnapshot.js";

/**
 * Serializes Customer aggregate root into flattened CustomerSnapshot models.
 */
export class CustomerSerializer {
  public static serialize(aggregate: Customer): CustomerSnapshot {
    return {
      id: aggregate.id.value,
      organizationId: aggregate.organizationId.value,
      customerNumber: aggregate.customerNumber.value,
      name: aggregate.name.value,
      companyName: aggregate.companyName ? aggregate.companyName.value : null,
      status: aggregate.status,
      taxIdentifier: aggregate.taxIdentifier ? aggregate.taxIdentifier.value : null,
      phoneNumber: aggregate.phoneNumber ? aggregate.phoneNumber.value : null,
      website: aggregate.website ? aggregate.website.value : null,
      email: aggregate.email ? aggregate.email.value : null,
      addresses: aggregate.addresses.map((a) => ({
        id: a.id.value,
        line1: a.address.line1,
        city: a.address.city,
        state: a.address.state,
        country: a.address.country,
        postalCode: a.address.postalCode,
        line2: a.address.line2 || null,
        type: a.type
      })),
      contacts: aggregate.contacts.map((c) => ({
        id: c.id.value,
        name: c.name,
        email: c.email.value,
        phone: c.phone ? c.phone.value : null,
        isPrimary: c.isPrimary
      })),
      notes: aggregate.notes.map((n) => ({
        id: n.id.value,
        content: n.content,
        authorId: n.createdBy.value,
        createdAt: n.createdAt
      })),
      communicationPreferences: {
        emailEnabled: aggregate.communicationPreferences.email,
        smsEnabled: aggregate.communicationPreferences.sms,
        pushEnabled: aggregate.communicationPreferences.portal
      },
      createdAt: aggregate.createdAt,
      updatedAt: aggregate.updatedAt
    };
  }
}
