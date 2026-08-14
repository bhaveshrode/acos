"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRepository = void 0;
const BaseRepository_js_1 = require("../base/BaseRepository.js");
const Result_js_1 = require("../../../foundation/result/Result.js");
const ResultError_js_1 = require("../../../foundation/result/ResultError.js");
const CustomerExtractor_js_1 = require("../../persistence/extractors/CustomerExtractor.js");
const CustomerHydrator_js_1 = require("../../persistence/hydrators/CustomerHydrator.js");
/**
 * Concrete infrastructure repository implementing Customer persistence operations.
 */
class CustomerRepository extends BaseRepository_js_1.BaseRepository {
    async findById(id) {
        try {
            const customerRow = await this.prisma.customer.findUnique({
                where: { id: id.value }
            });
            if (!customerRow) {
                return Result_js_1.Result.fail(ResultError_js_1.ResultError.notFound(`Customer with ID ${id.value} not found.`));
            }
            const addresses = await this.prisma.customerAddress.findMany({
                where: { customerId: id.value }
            });
            const contacts = await this.prisma.customerContact.findMany({
                where: { customerId: id.value }
            });
            const notes = await this.prisma.customerNote.findMany({
                where: { customerId: id.value }
            });
            const snapshot = {
                ...customerRow,
                addresses,
                contacts,
                notes,
                communicationPreferences: {
                    emailEnabled: customerRow.emailEnabled ?? true,
                    smsEnabled: customerRow.smsEnabled ?? true,
                    pushEnabled: customerRow.pushEnabled ?? true
                }
            };
            const aggregate = CustomerHydrator_js_1.CustomerHydrator.hydrate(snapshot);
            return Result_js_1.Result.ok(aggregate);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async findByCustomerNumber(orgId, number) {
        try {
            const customerRow = await this.prisma.customer.findFirst({
                where: {
                    organizationId: orgId.value,
                    customerNumber: number.value
                }
            });
            if (!customerRow) {
                return Result_js_1.Result.fail(ResultError_js_1.ResultError.notFound(`Customer with number ${number.value} under organization ${orgId.value} not found.`));
            }
            const idVal = customerRow.id;
            const addresses = await this.prisma.customerAddress.findMany({ where: { customerId: idVal } });
            const contacts = await this.prisma.customerContact.findMany({ where: { customerId: idVal } });
            const notes = await this.prisma.customerNote.findMany({ where: { customerId: idVal } });
            const snapshot = {
                ...customerRow,
                addresses,
                contacts,
                notes,
                communicationPreferences: {
                    emailEnabled: customerRow.emailEnabled ?? true,
                    smsEnabled: customerRow.smsEnabled ?? true,
                    pushEnabled: customerRow.pushEnabled ?? true
                }
            };
            const aggregate = CustomerHydrator_js_1.CustomerHydrator.hydrate(snapshot);
            return Result_js_1.Result.ok(aggregate);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async findByOrganization(orgId) {
        try {
            const customerRows = await this.prisma.customer.findMany({
                where: { organizationId: orgId.value }
            });
            const aggregates = [];
            for (const row of customerRows) {
                const addresses = await this.prisma.customerAddress.findMany({ where: { customerId: row.id } });
                const contacts = await this.prisma.customerContact.findMany({ where: { customerId: row.id } });
                const notes = await this.prisma.customerNote.findMany({ where: { customerId: row.id } });
                const snapshot = {
                    ...row,
                    addresses,
                    contacts,
                    notes,
                    communicationPreferences: {
                        emailEnabled: row.emailEnabled ?? true,
                        smsEnabled: row.smsEnabled ?? true,
                        pushEnabled: row.pushEnabled ?? true
                    }
                };
                aggregates.push(CustomerHydrator_js_1.CustomerHydrator.hydrate(snapshot));
            }
            return Result_js_1.Result.ok(aggregates);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async exists(orgId, number) {
        try {
            const count = await this.prisma.customer.count({
                where: {
                    organizationId: orgId.value,
                    customerNumber: number.value
                }
            });
            return Result_js_1.Result.ok(count > 0);
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async save(customer) {
        try {
            const { customer: customerRow, addresses, contacts, notes } = CustomerExtractor_js_1.CustomerExtractor.extract(customer);
            const row = {
                ...customerRow,
                emailEnabled: customer.communicationPreferences.email,
                smsEnabled: customer.communicationPreferences.sms,
                pushEnabled: customer.communicationPreferences.push
            };
            await this.context.transaction(async (txContext) => {
                const txPrisma = txContext.client;
                await txPrisma.customer.upsert({
                    where: { id: row.id },
                    create: row,
                    update: row
                });
                // Sync addresses
                await txPrisma.customerAddress.deleteMany({ where: { customerId: customerRow.id } });
                if (addresses.length > 0) {
                    await txPrisma.customerAddress.createMany({ data: addresses });
                }
                // Sync contacts
                await txPrisma.customerContact.deleteMany({ where: { customerId: customerRow.id } });
                if (contacts.length > 0) {
                    await txPrisma.customerContact.createMany({ data: contacts });
                }
                // Sync notes
                await txPrisma.customerNote.deleteMany({ where: { customerId: customerRow.id } });
                if (notes.length > 0) {
                    await txPrisma.customerNote.createMany({ data: notes });
                }
            });
            return Result_js_1.Result.ok();
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
    async delete(id) {
        try {
            await this.context.transaction(async (txContext) => {
                const txPrisma = txContext.client;
                await txPrisma.customerAddress.deleteMany({ where: { customerId: id.value } });
                await txPrisma.customerContact.deleteMany({ where: { customerId: id.value } });
                await txPrisma.customerNote.deleteMany({ where: { customerId: id.value } });
                await txPrisma.customer.delete({ where: { id: id.value } });
            });
            return Result_js_1.Result.ok();
        }
        catch (error) {
            return Result_js_1.Result.fail(ResultError_js_1.ResultError.unexpected(error.message));
        }
    }
}
exports.CustomerRepository = CustomerRepository;
