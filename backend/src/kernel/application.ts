/**
 * Use-case surface: the commands, queries, handlers and mappers of each bounded
 * context, plus the mediator that dispatches them.
 *
 * Consumers drive the model from here. Reaching into `../business` to build
 * aggregates by hand is what this entry point exists to prevent.
 */

export { RecordReceivableCommand } from "../application/accounts_receivable/commands/RecordReceivableCommand.js";
export { GetReceivableByIdQueryHandler } from "../application/accounts_receivable/handlers/GetReceivableByIdQueryHandler.js";
export { RecordReceivableCommandHandler } from "../application/accounts_receivable/handlers/RecordReceivableCommandHandler.js";
export { ReceivableMapper } from "../application/accounts_receivable/mapping/ReceivableMapper.js";
export { GetReceivableByIdQuery } from "../application/accounts_receivable/queries/GetReceivableByIdQuery.js";

export { CreateCustomerCommand } from "../application/customer/commands/CreateCustomerCommand.js";
export { CreateCustomerCommandHandler } from "../application/customer/handlers/CreateCustomerCommandHandler.js";
export { GetCustomerByIdQueryHandler } from "../application/customer/handlers/GetCustomerByIdQueryHandler.js";
export { CustomerMapper } from "../application/customer/mapping/CustomerMapper.js";
export { GetCustomerByIdQuery } from "../application/customer/queries/GetCustomerByIdQuery.js";

export { Mediator } from "../application/foundation/pipeline/Mediator.js";

export { RegisterUserCommand } from "../application/identity/commands/RegisterUserCommand.js";
export { RegisterUserCommandHandler } from "../application/identity/handlers/RegisterUserCommandHandler.js";
export { UserMapper } from "../application/identity/mapping/UserMapper.js";

export { CreateInvoiceCommand } from "../application/invoice/commands/CreateInvoiceCommand.js";
export { CreateInvoiceCommandHandler } from "../application/invoice/handlers/CreateInvoiceCommandHandler.js";
export { GetInvoiceByIdQueryHandler } from "../application/invoice/handlers/GetInvoiceByIdQueryHandler.js";
export { InvoiceMapper } from "../application/invoice/mapping/InvoiceMapper.js";
export { GetInvoiceByIdQuery } from "../application/invoice/queries/GetInvoiceByIdQuery.js";

export { CreateOrganizationCommand } from "../application/organization/commands/CreateOrganizationCommand.js";
export { CreateOrganizationCommandHandler } from "../application/organization/handlers/CreateOrganizationCommandHandler.js";
export { GetOrganizationByIdQueryHandler } from "../application/organization/handlers/GetOrganizationByIdQueryHandler.js";
export { OrganizationMapper } from "../application/organization/mapping/OrganizationMapper.js";
export { GetOrganizationByIdQuery } from "../application/organization/queries/GetOrganizationByIdQuery.js";

export { SubmitPaymentCommand } from "../application/payment/commands/SubmitPaymentCommand.js";
export { GetPaymentByIdQueryHandler } from "../application/payment/handlers/GetPaymentByIdQueryHandler.js";
export { SubmitPaymentCommandHandler } from "../application/payment/handlers/SubmitPaymentCommandHandler.js";
export { PaymentMapper } from "../application/payment/mapping/PaymentMapper.js";
export { GetPaymentByIdQuery } from "../application/payment/queries/GetPaymentByIdQuery.js";
