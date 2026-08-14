import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
// Domain imports
import { Customer } from "../../../business/customer/aggregates/Customer.js";
import { CustomerId } from "../../../business/customer/value-objects/CustomerId.js";
import { CustomerNumber } from "../../../business/customer/value-objects/CustomerNumber.js";
import { CustomerName } from "../../../business/customer/value-objects/CustomerName.js";
import { CompanyName } from "../../../business/customer/value-objects/CompanyName.js";
import { TaxIdentifier } from "../../../business/customer/value-objects/TaxIdentifier.js";
import { PhoneNumber } from "../../../business/customer/value-objects/PhoneNumber.js";
import { Website } from "../../../business/customer/value-objects/Website.js";
import { EmailAddress } from "../../../business/customer/value-objects/EmailAddress.js";
import { Address } from "../../../business/customer/value-objects/Address.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
/**
 * Use case handler registering a Customer aggregate.
 */
export class CreateCustomerCommandHandler {
    repository;
    mapper;
    constructor(repository, mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
    async handle(request) {
        const { dto } = request;
        const orgId = OrganizationId.from(dto.organizationId);
        // Instantiate and validate Domain Value Objects
        const custNumRes = CustomerNumber.create(dto.customerNumber);
        if (custNumRes.isFailure)
            return ApplicationResult.failure(custNumRes.error.message);
        // Verify uniqueness of Customer number within the Organization
        const existsRes = await this.repository.exists(orgId, custNumRes.value);
        if (existsRes.isFailure)
            return ApplicationResult.failure(existsRes.error.message);
        if (existsRes.value) {
            return ApplicationResult.failure(`Customer number '${dto.customerNumber}' already exists in this organization.`);
        }
        const nameRes = CustomerName.create(dto.name);
        if (nameRes.isFailure)
            return ApplicationResult.failure(nameRes.error.message);
        const contactEmailRes = EmailAddress.create(dto.primaryContact.email);
        if (contactEmailRes.isFailure)
            return ApplicationResult.failure(contactEmailRes.error.message);
        const contactPhoneRes = dto.primaryContact.phone
            ? PhoneNumber.create(dto.primaryContact.phone)
            : null;
        if (contactPhoneRes && contactPhoneRes.isFailure) {
            return ApplicationResult.failure(contactPhoneRes.error.message);
        }
        const billingAddressRes = Address.create(dto.billingAddress.line1, dto.billingAddress.city, dto.billingAddress.state, dto.billingAddress.country, dto.billingAddress.postalCode, dto.billingAddress.line2);
        if (billingAddressRes.isFailure)
            return ApplicationResult.failure(billingAddressRes.error.message);
        // Instantiate optional properties
        const companyName = dto.companyName ? CompanyName.create(dto.companyName).value : undefined;
        const taxIdentifier = dto.taxIdentifier ? TaxIdentifier.create(dto.taxIdentifier).value : undefined;
        const phoneNumber = dto.phoneNumber ? PhoneNumber.create(dto.phoneNumber).value : undefined;
        const website = dto.website ? Website.create(dto.website).value : undefined;
        const email = dto.email ? EmailAddress.create(dto.email).value : undefined;
        const initialContact = {
            id: new UniqueEntityID(),
            name: dto.primaryContact.name,
            email: contactEmailRes.value,
            phone: contactPhoneRes ? contactPhoneRes.value : undefined
        };
        // Instantiate Domain Aggregate
        const customerRes = Customer.create(CustomerId.generate(), orgId, custNumRes.value, nameRes.value, initialContact, billingAddressRes.value, {
            companyName,
            taxIdentifier,
            phoneNumber,
            website,
            email
        });
        if (customerRes.isFailure)
            return ApplicationResult.failure(customerRes.error.message);
        // Save and commit Customer aggregate
        const saveRes = await this.repository.save(customerRes.value);
        if (saveRes.isFailure)
            return ApplicationResult.failure(saveRes.error.message);
        return ApplicationResult.success(this.mapper.map(customerRes.value));
    }
}
