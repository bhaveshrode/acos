import { ACOSRuntime } from "acos-runtime";
import { UserId } from "acos-backend/business/identity/value-objects/UserId.js";
import { Email } from "acos-backend/business/identity/value-objects/Email.js";
import { SessionId } from "acos-backend/business/identity/value-objects/SessionId.js";
import { AuthenticationService } from "acos-backend/business/identity/services/AuthenticationService.js";
import { JwtTokenProvider } from "acos-backend/presentation/authentication/JwtTokenProvider.js";
import { RegisterUserCommand } from "acos-backend/application/identity/commands/RegisterUserCommand.js";
import { RegisterUserCommandHandler } from "acos-backend/application/identity/handlers/RegisterUserCommandHandler.js";
import { UserMapper } from "acos-backend/application/identity/mapping/UserMapper.js";
import { Mediator } from "acos-backend/application/foundation/pipeline/Mediator.js";
import { UniqueEntityID } from "acos-backend/foundation/core/Identifier.js";
import { OrganizationId } from "acos-backend/business/organization/value-objects/OrganizationId.js";
import { CreateOrganizationCommand } from "acos-backend/application/organization/commands/CreateOrganizationCommand.js";
import { CreateOrganizationCommandHandler } from "acos-backend/application/organization/handlers/CreateOrganizationCommandHandler.js";
import { GetOrganizationByIdQuery } from "acos-backend/application/organization/queries/GetOrganizationByIdQuery.js";
import { GetOrganizationByIdQueryHandler } from "acos-backend/application/organization/handlers/GetOrganizationByIdQueryHandler.js";
import { OrganizationMapper } from "acos-backend/application/organization/mapping/OrganizationMapper.js";
import { CustomerId } from "acos-backend/business/customer/value-objects/CustomerId.js";
import { CreateCustomerCommand } from "acos-backend/application/customer/commands/CreateCustomerCommand.js";
import { CreateCustomerCommandHandler } from "acos-backend/application/customer/handlers/CreateCustomerCommandHandler.js";
import { GetCustomerByIdQuery } from "acos-backend/application/customer/queries/GetCustomerByIdQuery.js";
import { GetCustomerByIdQueryHandler } from "acos-backend/application/customer/handlers/GetCustomerByIdQueryHandler.js";
import { CustomerMapper } from "acos-backend/application/customer/mapping/CustomerMapper.js";
import { InvoiceId } from "acos-backend/business/invoice/value-objects/InvoiceId.js";
import { CreateInvoiceCommand } from "acos-backend/application/invoice/commands/CreateInvoiceCommand.js";
import { CreateInvoiceCommandHandler } from "acos-backend/application/invoice/handlers/CreateInvoiceCommandHandler.js";
import { GetInvoiceByIdQuery } from "acos-backend/application/invoice/queries/GetInvoiceByIdQuery.js";
import { GetInvoiceByIdQueryHandler } from "acos-backend/application/invoice/handlers/GetInvoiceByIdQueryHandler.js";
import { InvoiceMapper } from "acos-backend/application/invoice/mapping/InvoiceMapper.js";
import { Money } from "acos-backend/business/invoice/value-objects/Money.js";
import { PaymentId } from "acos-backend/business/payment/value-objects/PaymentId.js";
import { TransactionHash } from "acos-backend/business/payment/value-objects/TransactionHash.js";
import { GatewayReference } from "acos-backend/business/payment/value-objects/GatewayReference.js";
import { ConfirmationCount } from "acos-backend/business/payment/value-objects/ConfirmationCount.js";
import { SubmitPaymentCommand } from "acos-backend/application/payment/commands/SubmitPaymentCommand.js";
import { SubmitPaymentCommandHandler } from "acos-backend/application/payment/handlers/SubmitPaymentCommandHandler.js";
import { GetPaymentByIdQuery } from "acos-backend/application/payment/queries/GetPaymentByIdQuery.js";
import { GetPaymentByIdQueryHandler } from "acos-backend/application/payment/handlers/GetPaymentByIdQueryHandler.js";
import { PaymentMapper } from "acos-backend/application/payment/mapping/PaymentMapper.js";
import { AccountsReceivable } from "acos-backend/business/accounts_receivable/aggregates/AccountsReceivable.js";
import { ReceivableAccountId } from "acos-backend/business/accounts_receivable/value-objects/ReceivableAccountId.js";
import { SettlementId } from "acos-backend/business/settlement/value-objects/SettlementId.js";
import { CreditAllocationPolicy } from "acos-backend/business/accounts_receivable/services/CreditAllocationPolicy.js";
import { RecordReceivableCommand } from "acos-backend/application/accounts_receivable/commands/RecordReceivableCommand.js";
import { RecordReceivableCommandHandler } from "acos-backend/application/accounts_receivable/handlers/RecordReceivableCommandHandler.js";
import { GetReceivableByIdQuery } from "acos-backend/application/accounts_receivable/queries/GetReceivableByIdQuery.js";
import { GetReceivableByIdQueryHandler } from "acos-backend/application/accounts_receivable/handlers/GetReceivableByIdQueryHandler.js";
import { ReceivableMapper } from "acos-backend/application/accounts_receivable/mapping/ReceivableMapper.js";
import { MessagingFactory } from "acos-backend/infrastructure/messaging/factories/MessagingFactory.js";
import { OutboxEventBus } from "./OutboxEventBus.js";
import { AcosPasswordHasher } from "./AcosPasswordHasher.js";
import { MockUserRepository, MockOrganizationRepository, MockCustomerRepository, MockInvoiceRepository, MockPaymentRepository, MockAccountsReceivableRepository } from "./MockRepositories.js";
import { SandboxPaymentProvider } from "./SandboxPaymentProvider.js";
export { OutboxEventBus } from "./OutboxEventBus.js";
export { AcosPasswordHasher } from "./AcosPasswordHasher.js";
export { MockUserRepository, MockOrganizationRepository, MockCustomerRepository, MockInvoiceRepository, MockPaymentRepository, MockAccountsReceivableRepository } from "./MockRepositories.js";
export { SandboxPaymentProvider } from "./SandboxPaymentProvider.js";
/**
 * Orchestrator acting as the gateway/boundary between Merchant and ACOS subsystems.
 */
export class AcosIntegrationBoundary {
    logger;
    runtime;
    isInitialized = false;
    isStarted = false;
    // Authoritative repositories and services inside the boundary
    userRepository = new MockUserRepository();
    organizationRepository = new MockOrganizationRepository();
    customerRepository = new MockCustomerRepository();
    invoiceRepository = new MockInvoiceRepository();
    paymentRepository = new MockPaymentRepository();
    accountsReceivableRepository = new MockAccountsReceivableRepository();
    passwordHasher = new AcosPasswordHasher();
    jwtProvider = new JwtTokenProvider("acos-secret-key-123456789-super-long-required-signing-key");
    authService = new AuthenticationService(this.passwordHasher);
    mediator;
    eventBus;
    prismaClient = null;
    isProcessingOutbox = false;
    // Sandbox provider context
    paymentProvider = new SandboxPaymentProvider();
    gatewayRefToPaymentId = new Map();
    // Local metadata registries
    businessMetadata = new Map();
    invoiceSentStatus = new Map(); // Stores sent lifecycle states
    constructor(logger, runtimeFactory) {
        this.logger = logger;
        this.runtime = new ACOSRuntime(runtimeFactory);
        const rawBus = MessagingFactory.getEventBus();
        this.eventBus = new OutboxEventBus(rawBus, this);
    }
    /**
     * Background runner that processes unprocessed OutboxEvent records sequentially.
     */
    async processOutboxAsynchronously() {
        if (this.isProcessingOutbox || !this.prismaClient)
            return;
        this.isProcessingOutbox = true;
        try {
            const records = await this.prismaClient.outboxEvent.findMany({
                where: { processed: false },
                orderBy: { createdAt: "asc" }
            });
            for (const record of records) {
                const eventData = JSON.parse(record.payload);
                const domainEvent = {
                    ...eventData,
                    eventName: record.eventType,
                    occurredOn: new Date(eventData.occurredOn || Date.now()),
                    getAggregateId() {
                        return this.metadata?.aggregateId || "";
                    }
                };
                const rawBus = this.eventBus.underlyingBus;
                await rawBus.publish(domainEvent);
                await this.prismaClient.outboxEvent.update({
                    where: { id: record.id },
                    data: {
                        processed: true,
                        processedAt: new Date()
                    }
                });
            }
        }
        catch (err) {
            this.logger.error("Failed to process transaction outbox events", err);
        }
        finally {
            this.isProcessingOutbox = false;
        }
    }
    /**
     * Initializes and boots ACOS runtime subsystems and wires up CQRS handlers.
     */
    async connect(env, dbUrl) {
        try {
            this.logger.info("Initializing ACOS Integration Boundary...", { env, dbUrl });
            if (dbUrl) {
                this.logger.info("dbUrl provided, instantiating production PostgreSQL database repositories.");
                const { PrismaClient } = await import("@prisma/client");
                const pg = await import("pg");
                const { PrismaPg } = await import("@prisma/adapter-pg");
                const pool = new pg.default.Pool({ connectionString: dbUrl });
                const adapter = new PrismaPg(pool);
                const prismaClient = new PrismaClient({ adapter });
                const { PrismaUserRepository, PrismaOrganizationRepository, PrismaCustomerRepository, PrismaInvoiceRepository, PrismaPaymentRepository, PrismaAccountsReceivableRepository } = await import("./PrismaRepositories.js");
                this.prismaClient = prismaClient;
                this.userRepository = new PrismaUserRepository(prismaClient);
                this.organizationRepository = new PrismaOrganizationRepository(prismaClient);
                this.customerRepository = new PrismaCustomerRepository(prismaClient);
                this.invoiceRepository = new PrismaInvoiceRepository(prismaClient);
                this.paymentRepository = new PrismaPaymentRepository(prismaClient);
                this.accountsReceivableRepository = new PrismaAccountsReceivableRepository();
            }
            await this.runtime.initialize(env);
            this.isInitialized = true;
            this.mediator = this.runtime.getSubsystem("backend");
            if (!this.mediator) {
                this.mediator = new Mediator();
            }
            // Wire up ACOS Identity handler
            const userMapper = new UserMapper();
            this.mediator.registerHandler(RegisterUserCommand, new RegisterUserCommandHandler(this.userRepository, userMapper, this.passwordHasher));
            // Wire up ACOS Organization handlers
            const orgMapper = new OrganizationMapper();
            this.mediator.registerHandler(CreateOrganizationCommand, new CreateOrganizationCommandHandler(this.organizationRepository, orgMapper));
            this.mediator.registerHandler(GetOrganizationByIdQuery, new GetOrganizationByIdQueryHandler(this.organizationRepository, orgMapper));
            // Wire up ACOS Customer handlers
            const customerMapper = new CustomerMapper();
            this.mediator.registerHandler(CreateCustomerCommand, new CreateCustomerCommandHandler(this.customerRepository, customerMapper));
            this.mediator.registerHandler(GetCustomerByIdQuery, new GetCustomerByIdQueryHandler(this.customerRepository, customerMapper));
            // Wire up ACOS Invoice handlers
            const invoiceMapper = new InvoiceMapper();
            this.mediator.registerHandler(CreateInvoiceCommand, new CreateInvoiceCommandHandler(this.invoiceRepository, invoiceMapper));
            this.mediator.registerHandler(GetInvoiceByIdQuery, new GetInvoiceByIdQueryHandler(this.invoiceRepository, invoiceMapper));
            // Wire up ACOS Payment handlers
            const paymentMapper = new PaymentMapper();
            this.mediator.registerHandler(SubmitPaymentCommand, new SubmitPaymentCommandHandler(this.paymentRepository, paymentMapper));
            this.mediator.registerHandler(GetPaymentByIdQuery, new GetPaymentByIdQueryHandler(this.paymentRepository, paymentMapper));
            // Wire up ACOS Accounts Receivable handlers (Phase 6)
            const arMapper = new ReceivableMapper();
            this.mediator.registerHandler(RecordReceivableCommand, new RecordReceivableCommandHandler(this.accountsReceivableRepository, arMapper));
            this.mediator.registerHandler(GetReceivableByIdQuery, new GetReceivableByIdQueryHandler(this.accountsReceivableRepository, arMapper));
            this.logger.info("Starting ACOS Runtime subsystems...");
            const startResult = await this.runtime.start();
            this.isStarted = startResult;
            this.logger.info("ACOS Integration Boundary connected successfully.");
            return startResult;
        }
        catch (error) {
            this.logger.error("Failed to connect ACOS Integration Boundary", error);
            throw new Error(`ACOS Connection Failed: ${error.message}`);
        }
    }
    /**
     * Sign Up a new merchant user. Registers through ACOS Identity and automatically activates their account.
     */
    async signUp(email, passwordPlaintext, name) {
        this.logger.info("signUp: Dispatching RegisterUserCommand to ACOS mediator...");
        const command = new RegisterUserCommand({
            email,
            passwordPlaintext,
            name
        });
        const result = (await this.mediator.send(command));
        if (!result.isSuccess) {
            const errMsg = result.errors.join(", ");
            this.logger.warn("signUp failed inside ACOS Identity", { error: errMsg });
            throw new Error(errMsg);
        }
        const emailRes = Email.create(email);
        const userRes = await this.userRepository.findByEmail(emailRes.value);
        if (userRes.isSuccess) {
            const user = userRes.value;
            const verificationToken = user.verificationToken?.token ?? "";
            const verifyRes = user.verifyEmail(verificationToken);
            if (verifyRes.isSuccess) {
                await this.userRepository.save(user);
                this.logger.info("signUp: User verification succeeded and status set to ACTIVE.");
            }
            else {
                this.logger.error("signUp: Failed to verify email verification token", new Error(verifyRes.error?.message));
            }
        }
        return {
            ...result.value,
            status: userRes.isSuccess ? userRes.value.status : result.value.status
        };
    }
    /**
     * Login user. Verifies plaintext credentials against hash, records attempts, and returns signed JWT token.
     */
    async login(email, passwordPlaintext, ipAddress) {
        this.logger.info("login: Querying user credentials from ACOS Identity...");
        const emailRes = Email.create(email);
        if (emailRes.isFailure) {
            throw new Error(emailRes.error.message);
        }
        const userRes = await this.userRepository.findByEmail(emailRes.value);
        if (userRes.isFailure) {
            this.logger.warn("login: User with email does not exist", { email });
            throw new Error("Authentication failed. Invalid credentials.");
        }
        const user = userRes.value;
        const authRes = await this.authService.authenticate(user, passwordPlaintext, ipAddress, () => "ref-" + Math.random().toString(36).substring(2, 15));
        await this.userRepository.save(user);
        if (authRes.isFailure) {
            this.logger.warn("login: Authentication validation failed", { error: authRes.error.message });
            throw new Error(authRes.error.message);
        }
        const session = authRes.value;
        this.logger.info("login: Authentication succeeded. Generating session token...");
        const token = this.jwtProvider.generateToken({
            sub: user.id.value,
            email: user.email.value,
            name: user.name,
            sessionId: session.sessionId.value
        }, 120);
        return {
            user: {
                id: user.id.value,
                email: user.email.value,
                name: user.name,
                status: user.status
            },
            token
        };
    }
    /**
     * Terminate active user session using token claims.
     */
    async logout(token) {
        try {
            this.logger.info("logout: Terminating session...");
            const claims = this.jwtProvider.verifyToken(token);
            const userIdVal = claims.sub;
            const sessionIdVal = claims.sessionId;
            const userRes = await this.userRepository.findById(new UserId(userIdVal));
            if (userRes.isSuccess) {
                const user = userRes.value;
                const terminateRes = user.terminateSession(new SessionId(sessionIdVal));
                if (terminateRes.isSuccess) {
                    await this.userRepository.save(user);
                    this.logger.info("logout: Session successfully terminated on ACOS User aggregate.");
                }
            }
        }
        catch (err) {
            this.logger.error("logout: Exception occurred while revoking session", err);
            throw new Error(`Logout failed: ${err.message}`);
        }
    }
    /**
     * Retrieve active user details using verified token claims.
     */
    async me(token) {
        try {
            const claims = this.jwtProvider.verifyToken(token);
            const userIdVal = claims.sub;
            const userRes = await this.userRepository.findById(new UserId(userIdVal));
            if (userRes.isFailure) {
                throw new Error("User associated with session not found.");
            }
            console.log("[AcosIntegrationBoundary] me: claims.sessionId:", claims.sessionId);
            console.log("[AcosIntegrationBoundary] me: user sessions:", userRes.value.sessions.map(s => ({
                sessionId: s.sessionId.value,
                status: s.status,
                expiresAt: s.expiresAt
            })));
            const session = userRes.value.sessions.find(s => s.sessionId.value === claims.sessionId);
            if (!session) {
                console.log("[AcosIntegrationBoundary] me: No matching session found for claims.sessionId");
                throw new Error("Session is revoked or expired.");
            }
            if (session.status !== "ACTIVE") {
                console.log("[AcosIntegrationBoundary] me: Session status is not ACTIVE, status:", session.status);
                throw new Error("Session is revoked or expired.");
            }
            return {
                id: userRes.value.id.value,
                email: userRes.value.email.value,
                name: userRes.value.name,
                status: userRes.value.status
            };
        }
        catch (err) {
            this.logger.warn("me: Session token verification failed", { error: err.message });
            throw new Error(`Unauthorized: ${err.message}`);
        }
    }
    // ========================================================
    // BUSINESS / TENANT ONBOARDING METHODS
    // ========================================================
    /**
     * Helper to verify if the given userId owns the specified organizationId.
     */
    async verifyBusinessOwnership(userId, orgId) {
        const orgRes = await this.organizationRepository.findById(new OrganizationId(orgId));
        if (orgRes.isFailure) {
            throw new Error("Business context not found.");
        }
        console.error("[verifyBusinessOwnership] userId:", userId, "orgOwnerId:", orgRes.value.ownerId.value);
        if (orgRes.value.ownerId.value !== userId) {
            throw new Error("Access Denied: You do not have permissions to manage this business context.");
        }
    }
    /**
     * Onboards a new Business (Organization) in ACOS.
     */
    async onboardBusiness(userId, name, slug, currency, businessType, country, contactInfo) {
        this.logger.info("onboardBusiness: Initiating business onboarding...", { userId, name, slug });
        if (!name || name.trim() === "")
            throw new Error("Business Name is required.");
        if (!slug || slug.trim() === "")
            throw new Error("Business Slug is required.");
        if (!userId)
            throw new Error("Owner User ID is required.");
        const existingBusiness = await this.getBusinessForUser(userId);
        if (existingBusiness) {
            throw new Error("Onboarding Blocked: User already owns an active business context.");
        }
        const command = new CreateOrganizationCommand({
            name,
            slug,
            ownerId: userId,
            currency
        });
        const result = (await this.mediator.send(command));
        if (!result.isSuccess) {
            const errMsg = result.errors.join(", ");
            this.logger.warn("onboardBusiness: ACOS rejected organization creation", { error: errMsg });
            throw new Error(errMsg);
        }
        const orgDto = result.value;
        this.businessMetadata.set(orgDto.id, {
            businessType,
            country,
            contactInfo
        });
        this.logger.info("onboardBusiness: Business onboarding succeeded.", { businessId: orgDto.id });
        return {
            ...orgDto,
            businessType,
            country,
            contactInfo
        };
    }
    /**
     * Retrieves the current Business (Organization) context for the given User.
     */
    async getBusinessForUser(userId) {
        this.logger.info("getBusinessForUser: Searching business for user...", { userId });
        let ownerOrg = null;
        if ("items" in this.organizationRepository) {
            for (const org of this.organizationRepository.items.values()) {
                if (org.ownerId.value === userId) {
                    ownerOrg = org;
                    break;
                }
            }
        }
        else {
            const { PrismaOrganizationRepository } = await import("./PrismaRepositories.js");
            const orgId = PrismaOrganizationRepository.ownerMap.get(userId);
            if (orgId) {
                const orgRes = await this.organizationRepository.findById(new OrganizationId(orgId));
                if (orgRes.isSuccess) {
                    ownerOrg = orgRes.value;
                }
            }
        }
        if (!ownerOrg) {
            this.logger.info("getBusinessForUser: No active business context found.", { userId });
            return null;
        }
        const orgMapper = new OrganizationMapper();
        const orgDto = orgMapper.map(ownerOrg);
        const metadata = this.businessMetadata.get(orgDto.id) ?? {
            businessType: "Unknown",
            country: "Unknown",
            contactInfo: "Unknown"
        };
        return {
            ...orgDto,
            ...metadata
        };
    }
    // ========================================================
    // CUSTOMER MANAGEMENT METHODS
    // ========================================================
    /**
     * Registers a new Customer under the authenticated business.
     */
    async createCustomer(userId, dto) {
        this.logger.info("createCustomer: Initiating customer registration...", { userId, orgId: dto.organizationId });
        await this.verifyBusinessOwnership(userId, dto.organizationId);
        const command = new CreateCustomerCommand(dto);
        const result = (await this.mediator.send(command));
        if (!result.isSuccess) {
            const errMsg = result.errors.join(", ");
            throw new Error(errMsg);
        }
        return result.value;
    }
    /**
     * Lists all Customers registered under the authenticated business.
     */
    async getCustomers(userId, orgId) {
        this.logger.info("getCustomers: Listing customers for business...", { userId, orgId });
        await this.verifyBusinessOwnership(userId, orgId);
        const customersRes = await this.customerRepository.findByOrganization(new OrganizationId(orgId));
        if (customersRes.isFailure) {
            throw new Error(customersRes.error.message);
        }
        const mapper = new CustomerMapper();
        return customersRes.value.map(cust => mapper.map(cust));
    }
    /**
     * Retrieves a single Customer profile, verifying tenant isolation boundaries.
     */
    async getCustomerById(userId, customerId) {
        this.logger.info("getCustomerById: Querying customer details...", { userId, customerId });
        const customerRes = await this.customerRepository.findById(new CustomerId(customerId));
        if (customerRes.isFailure) {
            throw new Error(`Customer with ID ${customerId} not found.`);
        }
        const customer = customerRes.value;
        await this.verifyBusinessOwnership(userId, customer.organizationId.value);
        const mapper = new CustomerMapper();
        return mapper.map(customer);
    }
    // ========================================================
    // INVOICE LIFECYCLE MANAGEMENT METHODS
    // ========================================================
    /**
     * Helper to map an Invoice aggregate to DTO, injecting SENT status if flagged.
     */
    mapInvoice(invoice) {
        const mapper = new InvoiceMapper();
        const dto = mapper.map(invoice);
        const isSent = this.invoiceSentStatus.get(invoice.id.value) === true;
        if (isSent && dto.status === "ISSUED") {
            dto.status = "SENT";
        }
        return dto;
    }
    /**
     * Registers a new DRAFT Invoice with line items under the authenticated business.
     */
    async createInvoice(userId, dto) {
        this.logger.info("createInvoice: Initiating invoice creation...", { userId, orgId: dto.organizationId });
        await this.verifyBusinessOwnership(userId, dto.organizationId);
        const customerRes = await this.customerRepository.findById(new CustomerId(dto.customerId));
        if (customerRes.isFailure) {
            throw new Error(`Customer with ID ${dto.customerId} not found.`);
        }
        if (customerRes.value.organizationId.value !== dto.organizationId) {
            throw new Error("Access Denied: Customer isolation boundary breach. Customer belongs to another business context.");
        }
        const command = new CreateInvoiceCommand(dto);
        const result = (await this.mediator.send(command));
        if (!result.isSuccess) {
            const errMsg = result.errors.join(", ");
            this.logger.warn("createInvoice: ACOS rejected invoice creation", { error: errMsg });
            throw new Error(errMsg);
        }
        this.logger.info("createInvoice succeeded.", { invoiceId: result.value.id });
        return result.value;
    }
    /**
     * Lists all Invoices registered under the authenticated business.
     */
    async getInvoices(userId, orgId) {
        this.logger.info("getInvoices: Listing invoices for business...", { userId, orgId });
        await this.verifyBusinessOwnership(userId, orgId);
        const invoicesRes = await this.invoiceRepository.findByOrganization(new OrganizationId(orgId));
        if (invoicesRes.isFailure) {
            throw new Error(invoicesRes.error.message);
        }
        return invoicesRes.value.map(invoice => this.mapInvoice(invoice));
    }
    /**
     * Retrieves detailed Invoice profile, checking tenant isolation boundaries.
     */
    async getInvoiceById(userId, invoiceId) {
        this.logger.info("getInvoiceById: Querying invoice details...", { userId, invoiceId });
        const invoiceRes = await this.invoiceRepository.findById(new InvoiceId(invoiceId));
        if (invoiceRes.isFailure) {
            throw new Error(`Invoice with ID ${invoiceId} not found.`);
        }
        const invoice = invoiceRes.value;
        await this.verifyBusinessOwnership(userId, invoice.organizationId.value);
        return this.mapInvoice(invoice);
    }
    /**
     * Transitions invoice status: DRAFT -> ISSUED.
     */
    async issueInvoice(userId, invoiceId) {
        this.logger.info("issueInvoice: Transitioning invoice DRAFT -> ISSUED...", { userId, invoiceId });
        const invoiceRes = await this.invoiceRepository.findById(new InvoiceId(invoiceId));
        if (invoiceRes.isFailure) {
            throw new Error(`Invoice with ID ${invoiceId} not found.`);
        }
        const invoice = invoiceRes.value;
        await this.verifyBusinessOwnership(userId, invoice.organizationId.value);
        const issueRes = invoice.issue();
        if (issueRes.isFailure) {
            this.logger.warn("issueInvoice: Aggregate rejected issuing", { error: issueRes.error.message });
            throw new Error(issueRes.error.message);
        }
        const saveRes = await this.invoiceRepository.save(invoice);
        if (saveRes.isFailure) {
            throw new Error(`Failed to save invoice aggregate: ${saveRes.error.message}`);
        }
        this.logger.info("issueInvoice: Successfully updated status to ISSUED.");
        return this.mapInvoice(invoice);
    }
    /**
     * Transitions invoice status: ISSUED -> SENT.
     */
    async sendInvoice(userId, invoiceId) {
        this.logger.info("sendInvoice: Transitioning invoice ISSUED -> SENT...", { userId, invoiceId });
        const invoiceRes = await this.invoiceRepository.findById(new InvoiceId(invoiceId));
        if (invoiceRes.isFailure) {
            throw new Error(`Invoice with ID ${invoiceId} not found.`);
        }
        const invoice = invoiceRes.value;
        await this.verifyBusinessOwnership(userId, invoice.organizationId.value);
        if (invoice.status !== "ISSUED") {
            throw new Error(`Cannot send invoice: State transition from ${invoice.status} to SENT is invalid.`);
        }
        this.invoiceSentStatus.set(invoice.id.value, true);
        this.logger.info("sendInvoice: Successfully updated status to SENT.");
        return this.mapInvoice(invoice);
    }
    // ========================================================
    // PAYMENT SANDBOX & RECONCILIATION METHODS (PHASE 5 & 6)
    // ========================================================
    /**
     * Initiates a Payment Request against a SENT invoice.
     */
    async createPaymentRequest(userId, invoiceId, customAmount) {
        this.logger.info("createPaymentRequest: Processing request...", { userId, invoiceId });
        const invoiceRes = await this.invoiceRepository.findById(new InvoiceId(invoiceId));
        if (invoiceRes.isFailure) {
            throw new Error(`Invoice with ID ${invoiceId} not found.`);
        }
        const invoice = invoiceRes.value;
        console.log("[createPaymentRequest] loaded invoice:", {
            id: invoice.id?.value,
            status: invoice.status,
            grandTotal: invoice.grandTotal,
            props: invoice.props
        });
        await this.verifyBusinessOwnership(userId, invoice.organizationId.value);
        const isSent = this.invoiceSentStatus.get(invoice.id.value) === true;
        if (!isSent || (invoice.status !== "ISSUED" && invoice.status !== "PARTIALLY_PAID")) {
            throw new Error("Payment request rejected: Payment collection is only allowed on SENT invoices.");
        }
        const paymentAmount = customAmount ?? invoice.grandTotal.amount;
        const currency = invoice.currency;
        const reference = `PAY-REF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const command = new SubmitPaymentCommand({
            organizationId: invoice.organizationId.value,
            customerId: invoice.customerId.value,
            reference,
            amount: paymentAmount,
            currency,
            method: "STRIPE",
            invoiceId: invoice.id.value,
            allocatedAmount: paymentAmount
        });
        const result = (await this.mediator.send(command));
        if (!result.isSuccess) {
            const errMsg = result.errors.join(", ");
            this.logger.warn("createPaymentRequest: SubmitPaymentCommand rejected by ACOS", { error: errMsg });
            throw new Error(errMsg);
        }
        const paymentDto = result.value;
        const paymentId = paymentDto.id;
        const providerResponse = await this.paymentProvider.initiatePayment(paymentId, paymentAmount, currency);
        const paymentRes = await this.paymentRepository.findById(new PaymentId(paymentId));
        if (paymentRes.isFailure) {
            throw new Error(`Failed to reload newly created payment aggregate with ID ${paymentId}`);
        }
        const payment = paymentRes.value;
        const attemptId1 = new UniqueEntityID();
        const attemptId2 = new UniqueEntityID();
        payment.submit(attemptId1);
        const gatewayRef = GatewayReference.create(providerResponse.gatewayReference).value;
        payment.startProcessing(attemptId2, gatewayRef);
        const saveRes = await this.paymentRepository.save(payment);
        if (saveRes.isFailure) {
            throw new Error(`Failed to save payment aggregate: ${saveRes.error.message}`);
        }
        this.gatewayRefToPaymentId.set(providerResponse.gatewayReference, paymentId);
        this.logger.info("createPaymentRequest succeeded.", { paymentId, gatewayReference: providerResponse.gatewayReference });
        const mapper = new PaymentMapper();
        return mapper.map(payment);
    }
    /**
     * Webhook callback simulated endpoint called by Sandbox provider.
     * Processes gateway confirmation AND executes Obligation Reconciliation (Phase 6).
     */
    async processPaymentWebhook(gatewayReference, success, errorCode, errorMessage) {
        this.logger.info("processPaymentWebhook: Processing webhook event...", { gatewayReference, success });
        const paymentId = this.gatewayRefToPaymentId.get(gatewayReference);
        if (!paymentId) {
            throw new Error(`No payment aggregate registered under gateway reference: ${gatewayReference}`);
        }
        const paymentRes = await this.paymentRepository.findById(new PaymentId(paymentId));
        if (paymentRes.isFailure) {
            throw new Error(`Payment aggregate associated with ID ${paymentId} not found.`);
        }
        const payment = paymentRes.value;
        // Idempotency: Ignore duplicate webhooks if payment is already confirmed
        if (payment.status === "CONFIRMED") {
            this.logger.info("processPaymentWebhook: Duplicate webhook received. Payment is already CONFIRMED. Ignoring.");
            const mapper = new PaymentMapper();
            return mapper.map(payment);
        }
        const providerResponse = await this.paymentProvider.completePayment(gatewayReference, success);
        const attemptId = new UniqueEntityID();
        if (success) {
            const txHash = TransactionHash.create(providerResponse.transactionHash).value;
            const count = ConfirmationCount.create(1).value;
            const confirmRes = payment.confirm(attemptId, txHash, count);
            if (confirmRes.isFailure) {
                throw new Error(confirmRes.error.message);
            }
            this.logger.info("processPaymentWebhook: Payment status marked as CONFIRMED.");
            // ========================================================
            // RECONCILIATION ENGINE (PHASE 6)
            // ========================================================
            for (const allocation of payment.allocations) {
                // 1. Load target Invoice
                const invoiceRes = await this.invoiceRepository.findById(allocation.invoiceId);
                if (invoiceRes.isFailure) {
                    throw new Error(`Reconciliation Obligation Target Not Found: Invoice ${allocation.invoiceId.value} not found.`);
                }
                const invoice = invoiceRes.value;
                // 2. Tenant Boundary Isolation Check
                if (invoice.organizationId.value !== payment.organizationId.value) {
                    throw new Error("Access Denied: Cross-tenant boundary breach. Confirmed payment cannot be reconciled against another merchant's invoice.");
                }
                // 3. Currency Validation
                if (invoice.currency !== allocation.allocatedAmount.currency) {
                    throw new Error(`Reconciliation Mismatch: Invoice currency ${invoice.currency} does not match allocation currency ${allocation.allocatedAmount.currency}.`);
                }
                // 4. Accounts Receivable Bookkeeping
                let ar;
                const arRes = await this.accountsReceivableRepository.findByCustomer(invoice.organizationId, invoice.customerId);
                if (arRes.isSuccess) {
                    ar = arRes.value;
                }
                else {
                    ar = AccountsReceivable.create(ReceivableAccountId.generate(), invoice.organizationId, invoice.customerId).value;
                }
                // Ensure obligation is registered in AR
                if (!ar.entries.some(e => e.invoiceId.equals(invoice.id))) {
                    ar.addInvoice(new UniqueEntityID(), invoice.id, invoice.grandTotal, invoice.dueDate.value);
                }
                // Apply allocation to AR entries
                const settlementId = new SettlementId(payment.id.value);
                const creditPolicy = new CreditAllocationPolicy();
                const applyRes = ar.applyPayment(new UniqueEntityID(), settlementId, invoice.id, Money.create(allocation.allocatedAmount.amount, allocation.allocatedAmount.currency).value, creditPolicy);
                if (applyRes.isFailure) {
                    throw new Error(`Accounts Receivable booking rejected: ${applyRes.error.message}`);
                }
                await this.accountsReceivableRepository.save(ar);
                // 5. Update Invoice Obligation Status (handling cumulative multi-payments)
                const allPaymentsRes = await this.paymentRepository.findByInvoice(invoice.organizationId, invoice.id);
                let cumulativePaid = 0;
                if (allPaymentsRes.isSuccess) {
                    // Sum allocations from CONFIRMED payments
                    for (const p of allPaymentsRes.value) {
                        const isConfirmed = p.status === "CONFIRMED" || p.id.equals(payment.id); // Include the current confirmed payment
                        if (isConfirmed) {
                            for (const a of p.allocations) {
                                if (a.invoiceId.equals(invoice.id)) {
                                    cumulativePaid += a.allocatedAmount.amount;
                                }
                            }
                        }
                    }
                }
                const cumulativeMoney = Money.create(cumulativePaid, invoice.currency).value;
                const recordRes = invoice.recordPayment(cumulativeMoney);
                if (recordRes.isFailure) {
                    throw new Error(`Invoice obligation status update failed: ${recordRes.error.message}`);
                }
                await this.invoiceRepository.save(invoice);
                // Publish ACOS invoice reconciliation events (e.g. InvoicePaid, InvoicePartiallyPaid, InvoiceOverpaid)
                if (invoice.domainEvents.length > 0) {
                    this.logger.info(`Publishing ACOS invoice reconciliation events to the Event Bus: ${invoice.domainEvents.map(e => e.eventName).join(", ")}`);
                    await this.eventBus.publishAll(invoice.domainEvents);
                    invoice.clearDomainEvents();
                }
            }
            this.logger.info("processPaymentWebhook: Reconciliation completed successfully.");
        }
        else {
            const failRes = payment.fail(attemptId, errorCode || providerResponse.errorCode || "DECLINED", errorMessage || providerResponse.errorMessage || "Declined by gateway");
            if (failRes.isFailure) {
                throw new Error(failRes.error.message);
            }
            this.logger.info("processPaymentWebhook: Payment marked as FAILED.");
        }
        await this.paymentRepository.save(payment);
        const mapper = new PaymentMapper();
        return mapper.map(payment);
    }
    /**
     * Retrieves single Payment profile details, checking tenant isolation.
     */
    async getPaymentById(userId, paymentId) {
        this.logger.info("getPaymentById: Fetching payment details...", { userId, paymentId });
        const paymentRes = await this.paymentRepository.findById(new PaymentId(paymentId));
        if (paymentRes.isFailure) {
            throw new Error(`Payment with ID ${paymentId} not found.`);
        }
        const payment = paymentRes.value;
        await this.verifyBusinessOwnership(userId, payment.organizationId.value);
        const mapper = new PaymentMapper();
        return mapper.map(payment);
    }
    /**
     * Lists all Payments for the active business context.
     */
    async getPayments(userId, orgId) {
        this.logger.info("getPayments: Listing payments for business...", { userId, orgId });
        await this.verifyBusinessOwnership(userId, orgId);
        const list = [];
        if ("items" in this.paymentRepository) {
            for (const payment of this.paymentRepository.items.values()) {
                if (payment.organizationId.value === orgId) {
                    list.push(payment);
                }
            }
        }
        else {
            const prisma = this.paymentRepository.prisma;
            if (prisma) {
                const rows = await prisma.payment.findMany({
                    where: { organizationId: orgId }
                });
                for (const row of rows) {
                    const res = await this.paymentRepository.findById(new PaymentId(row.id));
                    if (res.isSuccess) {
                        list.push(res.value);
                    }
                }
            }
        }
        const mapper = new PaymentMapper();
        return list.map(pay => mapper.map(pay));
    }
    /**
     * Generates aggregated Merchant Dashboard metrics by pulling data across Invoices, Payments, and Accounts Receivable.
     */
    async getDashboard(userId, orgId) {
        this.logger.info("getDashboard: Generating business dashboard data...", { userId, orgId });
        await this.verifyBusinessOwnership(userId, orgId);
        // 1. Fetch Invoices
        const invoicesRes = await this.invoiceRepository.findByOrganization(new OrganizationId(orgId));
        if (invoicesRes.isFailure)
            throw new Error(invoicesRes.error.message);
        const invoices = invoicesRes.value;
        // 2. Fetch Payments
        const payments = [];
        if ("items" in this.paymentRepository) {
            for (const p of this.paymentRepository.items.values()) {
                if (p.organizationId.value === orgId) {
                    payments.push(p);
                }
            }
        }
        else {
            const prisma = this.paymentRepository.prisma;
            if (prisma) {
                const rows = await prisma.payment.findMany({
                    where: { organizationId: orgId }
                });
                for (const row of rows) {
                    const res = await this.paymentRepository.findById(new PaymentId(row.id));
                    if (res.isSuccess) {
                        payments.push(res.value);
                    }
                }
            }
        }
        // 3. Fetch AR Accounts outstanding/credit summaries
        const orgRes = await this.organizationRepository.findById(new OrganizationId(orgId));
        if (orgRes.isFailure)
            throw new Error("Organization not found");
        const currency = orgRes.value.settings.defaultCurrency.value;
        let totalOutstanding = 0;
        let totalCredit = 0;
        for (const inv of invoices) {
            const isSent = this.invoiceSentStatus.get(inv.id.value) === true;
            if (inv.status === "ISSUED" && isSent) {
                totalOutstanding += inv.grandTotal.amount;
            }
            else if (inv.status === "PARTIALLY_PAID") {
                let paidAmount = 0;
                const allPaymentsRes = await this.paymentRepository.findByInvoice(new OrganizationId(orgId), inv.id);
                if (allPaymentsRes.isSuccess) {
                    for (const p of allPaymentsRes.value) {
                        if (p.status === "CONFIRMED") {
                            for (const a of p.allocations) {
                                if (a.invoiceId.equals(inv.id)) {
                                    paidAmount += a.allocatedAmount.amount;
                                }
                            }
                        }
                    }
                }
                totalOutstanding += Math.max(0, inv.grandTotal.amount - paidAmount);
            }
        }
        if ("items" in this.accountsReceivableRepository) {
            for (const ar of this.accountsReceivableRepository.items.values()) {
                if (ar.organizationId.value === orgId) {
                    totalCredit += ar.getCreditBalance(currency).amount;
                }
            }
        }
        else {
            const prisma = this.accountsReceivableRepository.prisma;
            if (prisma) {
                const rows = await prisma.receivableAccount.findMany({
                    where: { organizationId: orgId }
                });
                for (const row of rows) {
                    const res = await this.accountsReceivableRepository.findById(new ReceivableAccountId(row.id));
                    if (res.isSuccess) {
                        totalCredit += res.value.getCreditBalance(currency).amount;
                    }
                }
            }
        }
        // Compose Invoice metrics
        const invoiceSummary = {
            totalCount: invoices.length,
            totalAmount: invoices.reduce((sum, inv) => sum + inv.grandTotal.amount, 0),
            draftCount: invoices.filter(inv => inv.status === "DRAFT").length,
            issuedCount: invoices.filter(inv => inv.status === "ISSUED" && this.invoiceSentStatus.get(inv.id.value) !== true).length,
            sentCount: invoices.filter(inv => inv.status === "ISSUED" && this.invoiceSentStatus.get(inv.id.value) === true).length,
            partiallyPaidCount: invoices.filter(inv => inv.status === "PARTIALLY_PAID").length,
            paidCount: invoices.filter(inv => inv.status === "PAID").length,
            overpaidCount: invoices.filter(inv => inv.status === "OVERPAID").length
        };
        // Compose Payment metrics
        const paymentSummary = {
            totalCount: payments.length,
            totalAmount: payments.filter(p => p.status === "CONFIRMED").reduce((sum, p) => sum + p.amount.amount, 0),
            processingCount: payments.filter(p => p.status === "PROCESSING").length,
            confirmedCount: payments.filter(p => p.status === "CONFIRMED").length,
            failedCount: payments.filter(p => p.status === "FAILED").length
        };
        // Recent Invoices (limit to 5, sorted by creation date descending)
        const sortedInvoices = [...invoices].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
        const recentInvoices = [];
        for (const inv of sortedInvoices) {
            const custRes = await this.customerRepository.findById(inv.customerId);
            const customerName = custRes.isSuccess ? custRes.value.name.value : "Unknown Customer";
            recentInvoices.push({
                id: inv.id.value,
                invoiceNumber: inv.invoiceNumber.value,
                customerName,
                amount: inv.grandTotal.amount,
                currency: inv.grandTotal.currency,
                status: this.mapInvoice(inv).status
            });
        }
        // Recent Payments (limit to 5, sorted by creation date descending)
        const sortedPayments = [...payments].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
        const recentPayments = sortedPayments.map(p => ({
            id: p.id.value,
            reference: p.reference.value,
            amount: p.amount.amount,
            currency: p.amount.currency,
            status: p.status
        }));
        return {
            organizationId: orgId,
            currency,
            invoiceSummary,
            paymentSummary,
            outstandingAmount: totalOutstanding,
            creditAmount: totalCredit,
            recentInvoices,
            recentPayments
        };
    }
    /**
     * Verifies connectivity state and queries runtime health checks.
     */
    async checkConnectivity() {
        if (!this.isInitialized || !this.isStarted) {
            return {
                connected: false,
                status: "DISCONNECTED",
                subsystems: {},
                error: "ACOS Runtime has not been initialized or started."
            };
        }
        try {
            const health = await this.runtime.getHealth();
            const status = health.overallHealthy ? "CONNECTED" : "DEGRADED";
            return {
                connected: true,
                status,
                subsystems: {
                    backend: this.runtime.getStatus("backend")
                },
                health
            };
        }
        catch (error) {
            this.logger.error("ACOS Connectivity check failed during execution", error);
            return {
                connected: false,
                status: "ERROR",
                subsystems: {},
                error: error.message
            };
        }
    }
    /**
     * Gracefully shuts down ACOS subsystems.
     */
    async disconnect() {
        if (this.isStarted) {
            this.logger.info("Shutting down ACOS Integration Boundary...");
            await this.runtime.shutdown();
            this.isStarted = false;
            this.isInitialized = false;
            this.logger.info("ACOS Integration Boundary shut down successfully.");
        }
    }
}
