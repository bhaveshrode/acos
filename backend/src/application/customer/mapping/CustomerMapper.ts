import { IMapper } from "../../foundation/mapping/IMapper.js";
import { Customer } from "../../../business/customer/aggregates/Customer.js";
import { CustomerResponseDto } from "../dto/CustomerResponseDto.js";

/**
 * Mapper helper converting Customer aggregate entities into presentation CustomerResponseDto models.
 */
export class CustomerMapper implements IMapper<Customer, CustomerResponseDto> {
  public map(source: Customer): CustomerResponseDto {
    return {
      id: source.id.value,
      organizationId: source.organizationId.value,
      customerNumber: source.customerNumber.value,
      name: source.name.value,
      companyName: source.companyName ? source.companyName.value : null,
      status: source.status,
      taxIdentifier: source.taxIdentifier ? source.taxIdentifier.value : null,
      phoneNumber: source.phoneNumber ? source.phoneNumber.value : null,
      website: source.website ? source.website.value : null,
      email: source.email ? source.email.value : null,
      contacts: source.contacts.map((contact) => ({
        id: contact.id.value,
        name: contact.name,
        email: contact.email.value,
        phone: contact.phone ? contact.phone.value : null,
        isPrimary: contact.isPrimary
      })),
      addresses: source.addresses.map((addr) => ({
        id: addr.id.value,
        line1: addr.address.line1,
        line2: addr.address.line2 || null,
        city: addr.address.city,
        state: addr.address.state,
        postalCode: addr.address.postalCode,
        country: addr.address.country,
        type: addr.type
      })),
      createdAt: source.createdAt.toISOString(),
      updatedAt: source.updatedAt.toISOString()
    };
  }
}
