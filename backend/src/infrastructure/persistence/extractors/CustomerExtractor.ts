import { Customer } from "../../../business/customer/aggregates/Customer.js";
import { CustomerSerializer } from "../serializers/CustomerSerializer.js";

/**
 * Extracts distinct database records from the Customer aggregate graph.
 */
export class CustomerExtractor {
  public static extract(aggregate: Customer) {
    const snapshot = CustomerSerializer.serialize(aggregate);

    const customerRecord = {
      id: snapshot.id,
      organizationId: snapshot.organizationId,
      customerNumber: snapshot.customerNumber,
      name: snapshot.name,
      companyName: snapshot.companyName,
      status: snapshot.status,
      taxIdentifier: snapshot.taxIdentifier,
      phoneNumber: snapshot.phoneNumber,
      website: snapshot.website,
      email: snapshot.email,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt
    };

    return {
      customer: customerRecord,
      addresses: snapshot.addresses.map((a) => ({
        id: a.id,
        customerId: snapshot.id,
        line1: a.line1,
        line2: a.line2,
        city: a.city,
        state: a.state,
        country: a.country,
        postalCode: a.postalCode,
        type: a.type
      })),
      contacts: snapshot.contacts.map((c) => ({
        id: c.id,
        customerId: snapshot.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        isPrimary: c.isPrimary
      })),
      notes: snapshot.notes.map((n) => ({
        id: n.id,
        customerId: snapshot.id,
        content: n.content,
        authorId: n.authorId,
        createdAt: n.createdAt
      }))
    };
  }
}
