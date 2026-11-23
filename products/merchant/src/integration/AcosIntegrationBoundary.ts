import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";
import { ACOSRuntime } from "acos-runtime";
import {
  Logger,
  Result,
  ResultError,
  IPasswordHasher,
  IUserRepository,
  User,
  UserId,
  Email,
  SessionId,
  verifyUserEmail,
  terminateUserSession,
  EventSerializer,
  AuthenticationService,
  UniqueEntityID,
  IOrganizationRepository,
  Organization,
  OrganizationId,
  OrganizationSlug,
  ICustomerRepository,
  Customer,
  CustomerId,
  CustomerNumber,
  IInvoiceRepository,
  Invoice,
  InvoiceId,
  InvoiceNumber,
  issueInvoice as issueInvoiceOperation,
  markInvoiceSent,
  recordPayment,
  Money,
  IPaymentRepository,
  Payment,
  PaymentId,
  PaymentReference,
  submitPayment,
  startPaymentProcessing,
  confirmPayment,
  failPayment,
  TransactionHash,
  GatewayReference,
  ConfirmationCount,
  IAccountsReceivableRepository,
  AccountsReceivable,
  ReceivableAccountId,
  SettlementId,
  CreditAllocationPolicy,
  openReceivableAccount,
  registerInvoiceObligation,
  applyReceivablePayment,
  applyRefund,
  applyCustomerCredit,
  refundCustomerCredit,
  getReceivableCreditBalance,
  requestRefund,
  completeRefund,
  rejectRefund,
  approveRefund,
  recordRefund,
  RefundStatus,
  PaymentStatus,
  IEventBus
} from "acos-backend";
import { JwtTokenProvider } from "../adapters/security/JwtTokenProvider.js";
import { MessagingFactory } from "../adapters/messaging/factories/MessagingFactory.js";
import {
  RegisterUserCommand,
  RegisterUserCommandHandler,
  UserMapper,
  Mediator,
  CreateOrganizationCommand,
  CreateOrganizationCommandHandler,
  GetOrganizationByIdQuery,
  GetOrganizationByIdQueryHandler,
  OrganizationMapper,
  CreateCustomerCommand,
  CreateCustomerCommandHandler,
  GetCustomerByIdQuery,
  GetCustomerByIdQueryHandler,
  CustomerMapper,
  CreateInvoiceCommand,
  CreateInvoiceCommandHandler,
  GetInvoiceByIdQuery,
  GetInvoiceByIdQueryHandler,
  InvoiceMapper,
  SubmitPaymentCommand,
  SubmitPaymentCommandHandler,
  GetPaymentByIdQuery,
  GetPaymentByIdQueryHandler,
  PaymentMapper,
  RecordReceivableCommand,
  RecordReceivableCommandHandler,
  GetReceivableByIdQuery,
  GetReceivableByIdQueryHandler,
  ReceivableMapper
} from "acos-backend/application";

import { OutboxEventBus } from "./OutboxEventBus.js";
import { RedisStreamEventBus } from "../adapters/messaging/event-bus/RedisStreamEventBus.js";
import type { PrismaBusinessProfileRepository } from "./prisma/PrismaBusinessProfileRepository.js";
import { TransactionScope } from "../adapters/transactions/scopes/TransactionScope.js";
import { AcosPasswordHasher } from "./AcosPasswordHasher.js";
import {
  MockUserRepository,
  MockOrganizationRepository,
  MockCustomerRepository,
  MockInvoiceRepository,
  MockPaymentRepository,
  MockAccountsReceivableRepository
} from "./MockRepositories.js";
import { SandboxPaymentProvider } from "./SandboxPaymentProvider.js";
import { IPaymentProvider, PaymentResponse, RefundOutcomeUnknownError, RefundResponse } from "./PaymentProvider.js";

export { OutboxEventBus } from "./OutboxEventBus.js";
export { AcosPasswordHasher } from "./AcosPasswordHasher.js";
export {
  MockUserRepository,
  MockOrganizationRepository,
  MockCustomerRepository,
  MockInvoiceRepository,
  MockPaymentRepository,
  MockAccountsReceivableRepository
} from "./MockRepositories.js";
export { SandboxPaymentProvider } from "./SandboxPaymentProvider.js";
export { PaymentResponse, PaymentCompletion, IPaymentProvider } from "./PaymentProvider.js";
export { RazorpayPaymentProvider, RazorpayRestClient, RazorpayClient } from "./RazorpayPaymentProvider.js";
export { verifyRazorpaySignature, normalizeRazorpayEvent } from "./RazorpayWebhook.js";

export const OUTBOX_MAX_ATTEMPTS = 10;
export const OUTBOX_BASE_RETRY_DELAY_MS = 1_000;
export const OUTBOX_MAX_RETRY_DELAY_MS = 5 * 60_000;
export const OUTBOX_LOCK_LEASE_MS = 30_000;

export interface ConnectOptions {
  /**
   * Accepts the in-memory repositories, which drop every record when the process exits.
   */
  allowInMemory?: boolean;
  /**
   * Accepts the in-process event bus, whose events never leave this process.
   */
  allowInProcessBus?: boolean;
}

export interface BoundaryOptions {
  /**
   * Redis URL for the broker transport. Without it the boundary stays on the
   * in-process bus and outbox events never reach other replicas.
   */
  brokerUrl?: string;
  /**
   * Names this replica's consumer group. Every replica must be unique so each
   * one receives every event.
   */
  replicaId?: string;
  /**
   * Gateway used to collect payments. Defaults to the sandbox simulator.
   */
  paymentProvider?: IPaymentProvider;
}

/**
 * Orchestrator acting as the gateway/boundary between Merchant and ACOS subsystems.
 */
const STALE_REFUND_RESERVATION_MS = 15 * 60 * 1000;
const REFUND_SWEEP_INTERVAL_MS = 5 * 60 * 1000;

export class AcosIntegrationBoundary {
  private runtime: ACOSRuntime;
  private isInitialized = false;
  private isStarted = false;

  // Authoritative repositories and services inside the boundary
  public userRepository: IUserRepository = new MockUserRepository();
  public organizationRepository: IOrganizationRepository = new MockOrganizationRepository();
  public customerRepository: ICustomerRepository = new MockCustomerRepository();
  public invoiceRepository: IInvoiceRepository = new MockInvoiceRepository();
  public paymentRepository: IPaymentRepository = new MockPaymentRepository();
  public accountsReceivableRepository: IAccountsReceivableRepository = new MockAccountsReceivableRepository();
  public businessProfileRepository: PrismaBusinessProfileRepository | null = null;
  public readonly passwordHasher = new AcosPasswordHasher();
  public readonly jwtProvider = new JwtTokenProvider("acos-secret-key-123456789-super-long-required-signing-key");
  private readonly authService = new AuthenticationService(this.passwordHasher);
  private mediator!: Mediator;
  public readonly eventBus: IEventBus;
  private readonly transport: RedisStreamEventBus | null = null;
  public prismaClient: any = null;
  private readonly drainContext = new AsyncLocalStorage<boolean>();
  private drainChain: Promise<void> = Promise.resolve();
  private drainRequested = false;
  private outboxDrainPending = false;
  private outboxRetryTimer: NodeJS.Timeout | null = null;
  private outboxRetryAt = 0;
  private refundSweepTimer: NodeJS.Timeout | null = null;
  private readonly outboxClaimId = randomUUID();

  // Gateway used to collect payments (sandbox simulator unless injected)
  public readonly paymentProvider: IPaymentProvider;

  // Mock-mode metadata registry: the persistent context reads BusinessProfile rows instead.
  public readonly businessMetadata = new Map<string, { businessType: string; country: string; contactInfo: string }>();

  constructor(
    private readonly logger: Logger,
    runtimeFactory?: any,
    options: BoundaryOptions = {}
  ) {
    this.runtime = new ACOSRuntime(runtimeFactory);
    this.paymentProvider = options.paymentProvider ?? new SandboxPaymentProvider();

    if (options.brokerUrl) {
      this.transport = new RedisStreamEventBus({
        url: options.brokerUrl,
        replicaId: options.replicaId,
        logger
      });
      this.eventBus = new OutboxEventBus(this.transport, this);
    } else {
      this.eventBus = new OutboxEventBus(MessagingFactory.getEventBus(), this);
    }
  }

  /**
   * Database handle for the active unit of work: the ambient transaction client if one
   * is open, otherwise the root Prisma client. Outbox enqueues must use this so that the
   * event row commits atomically with the aggregate row.
   */
  public get dbClient(): any {
    return TransactionScope.current ?? this.prismaClient;
  }

  /**
   * Drains the outbox. When a transaction is open the drain is deferred until commit,
   * so subscribers never observe events whose aggregate write could still roll back.
   */
  public async requestOutboxDrain(): Promise<void> {
    if (TransactionScope.current) {
      this.outboxDrainPending = true;
      return;
    }
    await this.processOutboxAsynchronously();
  }

  /**
   * Runs `work` inside a database transaction and assigns that transaction's client to
   * the ambient TransactionScope, so repositories and the outbox enqueue join it.
   */
  private async withinTransaction<T>(work: () => Promise<T>): Promise<T> {
    if (!this.prismaClient || TransactionScope.current) {
      return work();
    }

    try {
      const result = await this.prismaClient.$transaction(async (tx: any) =>
        TransactionScope.run(tx, work)
      );

      if (this.outboxDrainPending) {
        this.outboxDrainPending = false;
        await this.processOutboxAsynchronously();
      }

      return result;
    } catch (err) {
      this.outboxDrainPending = false;
      throw err;
    }
  }

  /**
   * Background runner that processes unprocessed OutboxEvent records sequentially.
   * Concurrent callers queue behind the running pass instead of skipping it, so a
   * caller that has just committed events never returns before its own rows are
   * published. A call made from inside a pass (a handler publishing again) only
   * marks the pass dirty, letting it claim the new rows on its next sweep.
   */
  public async processOutboxAsynchronously(): Promise<void> {
    if (TransactionScope.current || !this.prismaClient) return;
    if (this.drainContext.getStore()) {
      this.drainRequested = true;
      return;
    }
    await this.queueOutboxDrain();
  }

  private async queueOutboxDrain(): Promise<void> {
    const pass = this.drainChain.then(() =>
      this.drainContext.run(true, () => this.drainOutbox())
    );
    this.drainChain = pass.catch(() => {});
    await pass;
  }

  private async drainOutbox(): Promise<void> {
    do {
      this.drainRequested = false;
      await this.drainOutboxBatch();
    } while (this.drainRequested);
  }

  private async drainOutboxBatch(): Promise<void> {
    try {
      const records = await this.claimOutboxBatch();

      const rawBus = (this.eventBus as OutboxEventBus).underlyingBus;
      for (const record of records) {
        try {
          const domainEvent = EventSerializer.deserialize(record.eventType, record.payload);
          await rawBus.publish(domainEvent);
        } catch (err: any) {
          const retryCount = (record.retryCount ?? 0) + 1;
          const lastError = String(err?.message ?? err);

          if (retryCount >= OUTBOX_MAX_ATTEMPTS) {
            await this.prismaClient.outboxEvent.update({
              where: { id: record.id },
              data: {
                retryCount,
                lastError,
                nextAttemptAt: null,
                deadLetteredAt: new Date(),
                lockedBy: null,
                lockedUntil: null
              }
            });
            this.logger.warn("Outbox event dead-lettered after repeated delivery failures", {
              id: record.id,
              eventType: record.eventType,
              retryCount
            });
            continue;
          }

          const nextAttemptAt = new Date(Date.now() + this.outboxRetryDelayMs(retryCount));
          await this.prismaClient.outboxEvent.update({
            where: { id: record.id },
            data: {
              retryCount,
              lastError,
              nextAttemptAt,
              lockedBy: null,
              lockedUntil: null
            }
          });
          this.scheduleOutboxRetry(nextAttemptAt);
          continue;
        }

        await this.prismaClient.outboxEvent.update({
          where: { id: record.id },
          data: {
            processed: true,
            processedAt: new Date(),
            lastError: null,
            nextAttemptAt: null,
            lockedBy: null,
            lockedUntil: null
          }
        });
      }
    } catch (err: any) {
      this.logger.error("Failed to process transaction outbox events", err);
    }
  }

  /**
   * Claims one batch for this process. The claim is an updateMany guarded on the
   * lock being free, so two drainers racing over the same rows claim disjoint
   * sets; reading back by claim id keeps rows another process holds out of the
   * batch. Locks expire, so a drainer that dies mid-publish frees its rows.
   */
  private async claimOutboxBatch(): Promise<any[]> {
    const now = new Date();
    const candidates = await this.prismaClient.outboxEvent.findMany({
      where: {
        processed: false,
        deadLetteredAt: null,
        OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
        AND: [{ OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }] }]
      },
      orderBy: { createdAt: "asc" },
      select: { id: true }
    });

    if (candidates.length === 0) return [];

    await this.prismaClient.outboxEvent.updateMany({
      where: {
        id: { in: candidates.map((candidate: any) => candidate.id) },
        processed: false,
        deadLetteredAt: null,
        OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }]
      },
      data: {
        lockedBy: this.outboxClaimId,
        lockedUntil: new Date(now.getTime() + OUTBOX_LOCK_LEASE_MS)
      }
    });

    return this.prismaClient.outboxEvent.findMany({
      where: {
        lockedBy: this.outboxClaimId,
        processed: false,
        deadLetteredAt: null,
        lockedUntil: { gt: new Date() }
      },
      orderBy: { createdAt: "asc" }
    });
  }

  private outboxRetryDelayMs(retryCount: number): number {
    return Math.min(OUTBOX_BASE_RETRY_DELAY_MS * 2 ** (retryCount - 1), OUTBOX_MAX_RETRY_DELAY_MS);
  }

  /**
   * A failed delivery must not wait for unrelated traffic to be retried, so the
   * earliest scheduled attempt arms a one-shot drain. Keeping only the earliest
   * timer avoids a timer per row; the callback re-reads eligibility from the DB
   * and re-arms for rows whose backoff outlasts the timer it just served.
   */
  private scheduleOutboxRetry(nextAttemptAt: Date): void {
    const at = nextAttemptAt.getTime();
    if (this.outboxRetryTimer && this.outboxRetryAt <= at) return;
    if (this.outboxRetryTimer) clearTimeout(this.outboxRetryTimer);

    this.outboxRetryAt = at;
    this.outboxRetryTimer = setTimeout(() => {
      this.outboxRetryTimer = null;
      this.outboxRetryAt = 0;
      // The timer is armed inside a drain pass and inherits that pass's context,
      // so it must queue a pass directly instead of going through the re-entrancy
      // guard, which would mistake it for a handler publishing again.
      void (async () => {
        await this.queueOutboxDrain();
        await this.armNextOutboxRetry();
      })().catch(() => {});
    }, Math.max(0, at - Date.now()));
    this.outboxRetryTimer.unref?.();
  }

  /**
   * A single timer only serves the earliest backoff it was armed for. Rows whose
   * nextAttemptAt lies further out would otherwise wait for unrelated traffic, so
   * every timer firing re-reads the earliest pending retry and arms the next one.
   */
  private async armNextOutboxRetry(): Promise<void> {
    if (this.outboxRetryTimer || !this.prismaClient) return;
    const next = await this.prismaClient.outboxEvent.findFirst({
      where: {
        processed: false,
        deadLetteredAt: null,
        nextAttemptAt: { not: null }
      },
      orderBy: { nextAttemptAt: "asc" },
      select: { nextAttemptAt: true }
    });
    if (next?.nextAttemptAt) {
      this.scheduleOutboxRetry(next.nextAttemptAt);
    }
  }

  /**
   * Initializes and boots ACOS runtime subsystems and wires up CQRS handlers.
   * Throws when no database URL is given and in-memory repositories were not explicitly
   * allowed, and when no broker URL was configured and the in-process bus was not explicitly
   * allowed.
   */
  public async connect(env: string, dbUrl?: string, options: ConnectOptions = {}): Promise<boolean> {
    if (!dbUrl && !options.allowInMemory) {
      throw new Error(
        "Refusing to start without persistence: connect() requires a database URL. Pass allowInMemory to accept repositories that drop all state on exit."
      );
    }

    if (!this.transport && !options.allowInProcessBus) {
      throw new Error(
        "Refusing to start without a broker: connect() requires a broker URL. Set MERCHANT_BROKER_URL, or pass allowInProcessBus to accept events that never leave this process."
      );
    }

    try {
      this.logger.info("Initializing ACOS Integration Boundary...", { env, dbUrl });

      if (dbUrl) {
        this.logger.info("dbUrl provided, instantiating production PostgreSQL database repositories.");
        const { PrismaClient } = await import("@prisma/client");
        const pg = await import("pg");
        const { PrismaPg } = await import("@prisma/adapter-pg");
        const pool = new pg.default.Pool({ connectionString: dbUrl });
        const adapter = new PrismaPg(pool);
        const prismaClient = new PrismaClient({ adapter } as any);

        const {
          PrismaUserRepository,
          PrismaOrganizationRepository,
          PrismaCustomerRepository,
          PrismaInvoiceRepository,
          PrismaPaymentRepository,
          PrismaAccountsReceivableRepository,
          PrismaBusinessProfileRepository
        } = await import("./PrismaRepositories.js");

        this.prismaClient = prismaClient;

        this.userRepository = new PrismaUserRepository(prismaClient) as any;
        this.organizationRepository = new PrismaOrganizationRepository(prismaClient) as any;
        this.businessProfileRepository = new PrismaBusinessProfileRepository(prismaClient);
        this.customerRepository = new PrismaCustomerRepository(prismaClient) as any;
        this.invoiceRepository = new PrismaInvoiceRepository(prismaClient) as any;
        this.paymentRepository = new PrismaPaymentRepository(prismaClient) as any;
        this.accountsReceivableRepository = new PrismaAccountsReceivableRepository(prismaClient) as any;
      } else {
        this.logger.warn(
          "Starting on in-memory repositories (allowInMemory): every record is lost when this process exits."
        );
      }

      if (this.transport) {
        await this.transport.start();
      } else {
        this.logger.warn(
          "Starting on the in-process event bus (allowInProcessBus): outbox events will not leave this process."
        );
      }

      await this.runtime.initialize(env);
      this.isInitialized = true;

      this.mediator = this.runtime.getSubsystem("backend") as Mediator;
      if (!this.mediator) {
        this.mediator = new Mediator();
      }

      // Wire up ACOS Identity handler
      const userMapper = new UserMapper();
      this.mediator.registerHandler(
        RegisterUserCommand as any,
        new RegisterUserCommandHandler(this.userRepository, userMapper, this.passwordHasher) as any
      );

      // Wire up ACOS Organization handlers
      const orgMapper = new OrganizationMapper();
      this.mediator.registerHandler(
        CreateOrganizationCommand as any,
        new CreateOrganizationCommandHandler(this.organizationRepository, orgMapper) as any
      );
      this.mediator.registerHandler(
        GetOrganizationByIdQuery as any,
        new GetOrganizationByIdQueryHandler(this.organizationRepository, orgMapper) as any
      );

      // Wire up ACOS Customer handlers
      const customerMapper = new CustomerMapper();
      this.mediator.registerHandler(
        CreateCustomerCommand as any,
        new CreateCustomerCommandHandler(this.customerRepository, customerMapper) as any
      );
      this.mediator.registerHandler(
        GetCustomerByIdQuery as any,
        new GetCustomerByIdQueryHandler(this.customerRepository, customerMapper) as any
      );

      // Wire up ACOS Invoice handlers
      const invoiceMapper = new InvoiceMapper();
      this.mediator.registerHandler(
        CreateInvoiceCommand as any,
        new CreateInvoiceCommandHandler(this.invoiceRepository, invoiceMapper, this.eventBus) as any
      );
      this.mediator.registerHandler(
        GetInvoiceByIdQuery as any,
        new GetInvoiceByIdQueryHandler(this.invoiceRepository, invoiceMapper) as any
      );

      // Wire up ACOS Payment handlers
      const paymentMapper = new PaymentMapper();
      this.mediator.registerHandler(
        SubmitPaymentCommand as any,
        new SubmitPaymentCommandHandler(this.paymentRepository, paymentMapper, this.eventBus) as any
      );
      this.mediator.registerHandler(
        GetPaymentByIdQuery as any,
        new GetPaymentByIdQueryHandler(this.paymentRepository, paymentMapper) as any
      );

      // Wire up ACOS Accounts Receivable handlers (Phase 6)
      const arMapper = new ReceivableMapper();
      this.mediator.registerHandler(
        RecordReceivableCommand as any,
        new RecordReceivableCommandHandler(this.accountsReceivableRepository, arMapper) as any
      );
      this.mediator.registerHandler(
        GetReceivableByIdQuery as any,
        new GetReceivableByIdQueryHandler(this.accountsReceivableRepository, arMapper) as any
      );

      this.logger.info("Starting ACOS Runtime subsystems...");
      const startResult = await this.runtime.start();
      this.isStarted = startResult;

      // Reclaim refund reservations a previous process left before its gateway
      // call; APPROVED ones are logged for reconciliation, never released.
      try {
        await this.sweepStaleRefundReservations();
      } catch (sweepErr: any) {
        this.logger.warn("Startup refund-reservation sweep failed; continuing.", { error: sweepErr.message });
      }
      // A reservation can only become stale after the startup pass, so keep
      // sweeping while the process runs.
      this.scheduleRefundReservationSweep();

      this.logger.info("ACOS Integration Boundary connected successfully.");
      return startResult;
    } catch (error: any) {
      this.logger.error("Failed to connect ACOS Integration Boundary", error);
      await this.transport?.close();
      throw new Error(`ACOS Connection Failed: ${error.message}`);
    }
  }

  /**
   * Sign Up a new merchant user. Registers through ACOS Identity and automatically activates their account.
   */
  public async signUp(email: string, passwordPlaintext: string, name: string): Promise<any> {
    this.logger.info("signUp: Dispatching RegisterUserCommand to ACOS mediator...");
    const command = new RegisterUserCommand({
      email,
      passwordPlaintext,
      name
    });

    const result = (await this.mediator.send(command as any)) as any;
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
      const verifyRes = verifyUserEmail(user, verificationToken);
      if (verifyRes.isSuccess) {
        await this.userRepository.save(user);
        this.logger.info("signUp: User verification succeeded and status set to ACTIVE.");
      } else {
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
  public async login(email: string, passwordPlaintext: string, ipAddress: string): Promise<{ user: any; token: string }> {
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
    const authRes = await this.authService.authenticate(
      user,
      passwordPlaintext,
      ipAddress,
      () => "ref-" + Math.random().toString(36).substring(2, 15)
    );

    await this.userRepository.save(user);

    if (authRes.isFailure) {
      this.logger.warn("login: Authentication validation failed", { error: authRes.error.message });
      throw new Error(authRes.error.message);
    }

    const session = authRes.value;
    this.logger.info("login: Authentication succeeded. Generating session token...");

    const token = this.jwtProvider.generateToken(
      {
        sub: user.id.value,
        email: user.email.value,
        name: user.name,
        sessionId: session.sessionId.value
      },
      120
    );

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
  public async logout(token: string): Promise<void> {
    try {
      this.logger.info("logout: Terminating session...");
      const claims = this.jwtProvider.verifyToken(token);
      const userIdVal = claims.sub;
      const sessionIdVal = claims.sessionId;

      const userRes = await this.userRepository.findById(new UserId(userIdVal));
      if (userRes.isSuccess) {
        const user = userRes.value;
        const terminateRes = terminateUserSession(user, new SessionId(sessionIdVal));
        if (terminateRes.isSuccess) {
          await this.userRepository.save(user);
          this.logger.info("logout: Session successfully terminated on ACOS User aggregate.");
        }
      }
    } catch (err: any) {
      this.logger.error("logout: Exception occurred while revoking session", err);
      throw new Error(`Logout failed: ${err.message}`);
    }
  }

  /**
   * Retrieve active user details using verified token claims.
   */
  public async me(token: string): Promise<any> {
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
    } catch (err: any) {
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
  private async verifyBusinessOwnership(userId: string, orgId: string): Promise<void> {
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
  public async onboardBusiness(
    userId: string,
    name: string,
    slug: string,
    currency: string,
    businessType: string,
    country: string,
    contactInfo: string
  ): Promise<any> {
    this.logger.info("onboardBusiness: Initiating business onboarding...", { userId, name, slug });

    if (!name || name.trim() === "") throw new Error("Business Name is required.");
    if (!slug || slug.trim() === "") throw new Error("Business Slug is required.");
    if (!userId) throw new Error("Owner User ID is required.");

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

    const result = (await this.mediator.send(command as any)) as any;
    if (!result.isSuccess) {
      const errMsg = result.errors.join(", ");
      this.logger.warn("onboardBusiness: ACOS rejected organization creation", { error: errMsg });
      throw new Error(errMsg);
    }

    const orgDto = result.value;

    if (this.businessProfileRepository) {
      await this.businessProfileRepository.save({
        organizationId: orgDto.id,
        businessType,
        country,
        contactInfo
      });
    } else {
      this.businessMetadata.set(orgDto.id, {
        businessType,
        country,
        contactInfo
      });
    }

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
  public async getBusinessForUser(userId: string): Promise<any> {
    this.logger.info("getBusinessForUser: Searching business for user...", { userId });

    let ownerOrg: Organization | null = null;
    if ("items" in this.organizationRepository) {
      for (const org of (this.organizationRepository as any).items.values()) {
        if (org.ownerId.value === userId) {
          ownerOrg = org;
          break;
        }
      }
    } else {
      const orgRes = await this.organizationRepository.findByOwner(new UserId(userId));
      if (orgRes.isSuccess) {
        ownerOrg = orgRes.value;
      }
    }

    if (!ownerOrg) {
      this.logger.info("getBusinessForUser: No active business context found.", { userId });
      return null;
    }

    const orgMapper = new OrganizationMapper();
    const orgDto = orgMapper.map(ownerOrg);

    const metadata = await this.resolveBusinessMetadata(orgDto.id);

    return {
      ...orgDto,
      ...metadata
    };
  }

  private async resolveBusinessMetadata(
    organizationId: string
  ): Promise<{ businessType: string; country: string; contactInfo: string }> {
    if (this.businessProfileRepository) {
      const profile = await this.businessProfileRepository.findByOrganization(organizationId);
      if (profile) {
        return {
          businessType: profile.businessType,
          country: profile.country,
          contactInfo: profile.contactInfo
        };
      }
    } else {
      const cached = this.businessMetadata.get(organizationId);
      if (cached) {
        return cached;
      }
    }

    return { businessType: "Unknown", country: "Unknown", contactInfo: "Unknown" };
  }

  // ========================================================
  // CUSTOMER MANAGEMENT METHODS
  // ========================================================

  /**
   * Registers a new Customer under the authenticated business.
   */
  public async createCustomer(userId: string, dto: any): Promise<any> {
    this.logger.info("createCustomer: Initiating customer registration...", { userId, orgId: dto.organizationId });

    await this.verifyBusinessOwnership(userId, dto.organizationId);

    const command = new CreateCustomerCommand(dto);
    const result = (await this.mediator.send(command as any)) as any;

    if (!result.isSuccess) {
      const errMsg = result.errors.join(", ");
      throw new Error(errMsg);
    }

    return result.value;
  }

  /**
   * Lists all Customers registered under the authenticated business.
   */
  public async getCustomers(userId: string, orgId: string): Promise<any[]> {
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
  public async getCustomerById(userId: string, customerId: string): Promise<any> {
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

  /**
   * Reports the unapplied credit the customer holds with this merchant, in
   * the business's default currency. A customer with no ledger activity has
   * no receivable account and therefore no credit.
   */
  public async getCustomerCreditBalance(
    userId: string,
    customerId: string
  ): Promise<{ customerId: string; currency: string; availableCredit: number }> {
    this.logger.info("getCustomerCreditBalance: Querying customer credit...", { userId, customerId });

    const customerRes = await this.customerRepository.findById(new CustomerId(customerId));
    if (customerRes.isFailure) {
      throw new Error(`Customer with ID ${customerId} not found.`);
    }
    const customer = customerRes.value;

    await this.verifyBusinessOwnership(userId, customer.organizationId.value);

    const orgRes = await this.organizationRepository.findById(customer.organizationId);
    if (orgRes.isFailure) throw new Error("Organization not found");
    const currency = orgRes.value.settings.defaultCurrency.value;

    const arRes = await this.accountsReceivableRepository.findByCustomer(
      customer.organizationId,
      customer.id
    );

    // Only a missing account means "no ledger activity, no credit". A database
    // or hydration failure must not surface as a plausible zero balance.
    let availableCredit = 0;
    if (arRes.isSuccess) {
      availableCredit = getReceivableCreditBalance(arRes.value, currency).amount;
    } else if (arRes.error.code !== "NOT_FOUND") {
      throw new Error(`Failed to read receivable ledger: ${arRes.error.message}`);
    }

    return {
      customerId: customer.id.value,
      currency,
      availableCredit
    };
  }

  // ========================================================
  // INVOICE LIFECYCLE MANAGEMENT METHODS
  // ========================================================

  /**
   * Helper to map an Invoice aggregate to DTO, reporting SENT when delivered.
   */
  private mapInvoice(invoice: Invoice): any {
    const mapper = new InvoiceMapper();
    const dto = mapper.map(invoice);

    if (invoice.sentAt && dto.status === "ISSUED") {
      dto.status = "SENT";
    }

    return dto;
  }

  /**
   * Registers a new DRAFT Invoice with line items under the authenticated business.
   */
  public async createInvoice(userId: string, dto: any): Promise<any> {
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
    const result = (await this.withinTransaction(() => this.mediator.send(command as any))) as any;

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
  public async getInvoices(userId: string, orgId: string): Promise<any[]> {
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
  public async getInvoiceById(userId: string, invoiceId: string): Promise<any> {
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
  public async issueInvoice(userId: string, invoiceId: string): Promise<any> {
    this.logger.info("issueInvoice: Transitioning invoice DRAFT -> ISSUED...", { userId, invoiceId });

    const invoice = await this.withinTransaction(async () => {
      const invoiceRes = await this.invoiceRepository.findById(new InvoiceId(invoiceId));
      if (invoiceRes.isFailure) {
        throw new Error(`Invoice with ID ${invoiceId} not found.`);
      }

      const aggregate = invoiceRes.value;

      await this.verifyBusinessOwnership(userId, aggregate.organizationId.value);

      const issueRes = issueInvoiceOperation(aggregate);
      if (issueRes.isFailure) {
        this.logger.warn("issueInvoice: Aggregate rejected issuing", { error: issueRes.error.message });
        throw new Error(issueRes.error.message);
      }

      const saveRes = await this.invoiceRepository.save(aggregate);
      if (saveRes.isFailure) {
        throw new Error(`Failed to save invoice aggregate: ${saveRes.error.message}`);
      }

      if (aggregate.domainEvents.length > 0) {
        await this.eventBus.publishAll(aggregate.domainEvents);
        aggregate.clearDomainEvents();
      }

      return aggregate;
    });

    this.logger.info("issueInvoice: Successfully updated status to ISSUED.");

    return this.mapInvoice(invoice);
  }

  /**
   * Transitions invoice status: ISSUED -> SENT.
   */
  public async sendInvoice(userId: string, invoiceId: string): Promise<any> {
    this.logger.info("sendInvoice: Transitioning invoice ISSUED -> SENT...", { userId, invoiceId });

    const invoice = await this.withinTransaction(async () => {
      const invoiceRes = await this.invoiceRepository.findById(new InvoiceId(invoiceId));
      if (invoiceRes.isFailure) {
        throw new Error(`Invoice with ID ${invoiceId} not found.`);
      }

      const aggregate = invoiceRes.value;

      await this.verifyBusinessOwnership(userId, aggregate.organizationId.value);

      if (aggregate.status !== "ISSUED") {
        throw new Error(`Cannot send invoice: State transition from ${aggregate.status} to SENT is invalid.`);
      }

      const sentRes = markInvoiceSent(aggregate);
      if (sentRes.isFailure) {
        throw new Error(`Invoice rejected sending: ${sentRes.error.message}`);
      }

      const saveRes = await this.invoiceRepository.save(aggregate);
      if (saveRes.isFailure) {
        throw new Error(`Failed to save invoice aggregate: ${saveRes.error.message}`);
      }

      return aggregate;
    });

    this.logger.info("sendInvoice: Successfully updated status to SENT.");

    return this.mapInvoice(invoice);
  }

  // ========================================================
  // PAYMENT SANDBOX & RECONCILIATION METHODS (PHASE 5 & 6)
  // ========================================================

  /**
   * Initiates a Payment Request against a SENT invoice.
   */
  public async createPaymentRequest(userId: string, invoiceId: string, customAmount?: number): Promise<any> {
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
      props: (invoice as any).props
    });

    await this.verifyBusinessOwnership(userId, invoice.organizationId.value);

    const isSent = invoice.sentAt !== null;
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
      method: this.paymentProvider.getMethodType(),
      invoiceId: invoice.id.value,
      allocatedAmount: paymentAmount
    });

    const result = (await this.withinTransaction(() => this.mediator.send(command as any))) as any;
    if (!result.isSuccess) {
      const errMsg = result.errors.join(", ");
      this.logger.warn("createPaymentRequest: SubmitPaymentCommand rejected by ACOS", { error: errMsg });
      throw new Error(errMsg);
    }

    const paymentDto = result.value;
    const paymentId = paymentDto.id;

    // Gateway I/O stays outside the unit of work so no DB transaction is held
    // open across an external call.
    let providerResponse: PaymentResponse;
    try {
      providerResponse = await this.paymentProvider.initiatePayment(paymentId, paymentAmount, currency);
    } catch (error) {
      // The payment row already exists here. Leaving it pending would make a
      // failed collection look like money in flight, and the next retry would
      // add another one, so it is terminal-failed before the error surfaces.
      await this.recordGatewayInitiationFailure(paymentId, error);
      throw error;
    }

    const payment = await this.withinTransaction(async () => {
      const paymentRes = await this.paymentRepository.findById(new PaymentId(paymentId));
      if (paymentRes.isFailure) {
        throw new Error(`Failed to reload newly created payment aggregate with ID ${paymentId}`);
      }

      const aggregate = paymentRes.value;
      const attemptId1 = new UniqueEntityID();
      const attemptId2 = new UniqueEntityID();

      submitPayment(aggregate, attemptId1);

      const gatewayRef = GatewayReference.create(providerResponse.gatewayReference).value;
      startPaymentProcessing(aggregate, attemptId2, gatewayRef);

      const saveRes = await this.paymentRepository.save(aggregate);
      if (saveRes.isFailure) {
        throw new Error(`Failed to save payment aggregate: ${saveRes.error.message}`);
      }

      const events = aggregate.domainEvents;
      aggregate.clearDomainEvents();
      await this.eventBus.publishAll(events);

      return aggregate;
    });

    this.logger.info("createPaymentRequest succeeded.", { paymentId, gatewayReference: providerResponse.gatewayReference });

    const mapper = new PaymentMapper();
    const dto = mapper.map(payment);
    return providerResponse.paymentUrl ? { ...dto, paymentUrl: providerResponse.paymentUrl } : dto;
  }

  /**
   * Terminal-fails a payment whose gateway link could not be opened. The
   * original gateway error is what the caller needs, so a failure to record
   * this is logged rather than thrown.
   */
  private async recordGatewayInitiationFailure(paymentId: string, error: unknown): Promise<void> {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.warn("createPaymentRequest: Gateway refused to open a payment; marking it failed.", {
      paymentId,
      error: message
    });

    try {
      await this.withinTransaction(async () => {
        const paymentRes = await this.paymentRepository.findById(new PaymentId(paymentId));
        if (paymentRes.isFailure) {
          throw new Error(paymentRes.error.message);
        }

        const payment = paymentRes.value;
        const failRes = failPayment(payment, new UniqueEntityID(), "GATEWAY_INITIATION_FAILED", message);
        if (failRes.isFailure) {
          throw new Error(failRes.error.message);
        }

        const saveRes = await this.paymentRepository.save(payment);
        if (saveRes.isFailure) {
          throw new Error(saveRes.error.message);
        }

        const events = payment.domainEvents;
        payment.clearDomainEvents();
        await this.eventBus.publishAll(events);
      });
    } catch (compensationError) {
      this.logger.error(
        "createPaymentRequest: Could not record the gateway failure; the payment remains pending.",
        compensationError instanceof Error ? compensationError : new Error(String(compensationError))
      );
    }
  }

  /**
   * Webhook callback simulated endpoint called by Sandbox provider.
   * Processes gateway confirmation AND executes Obligation Reconciliation (Phase 6).
   */
  public async processPaymentWebhook(
    gatewayReference: string,
    success: boolean,
    errorCode?: string,
    errorMessage?: string,
    gatewayPaymentId?: string
  ): Promise<any> {
    this.logger.info("processPaymentWebhook: Processing webhook event...", { gatewayReference, success });

    const gatewayRefRes = GatewayReference.create(gatewayReference);
    if (gatewayRefRes.isFailure) {
      throw new Error(`No payment aggregate registered under gateway reference: ${gatewayReference}`);
    }

    // Gateway I/O stays outside the unit of work so no DB transaction is held
    // open across an external call.
    const providerResponse = await this.paymentProvider.completePayment({
      gatewayReference,
      success,
      gatewayPaymentId,
      errorCode,
      errorMessage
    });
    const confirmed = success && providerResponse.status === "SUCCEEDED";
    if (success && !confirmed) {
      throw new Error(
        `Gateway has not captured this payment yet (status: ${providerResponse.status}). Retry the callback after capture.`
      );
    }

    const payment = await this.withinTransaction(async () => {
      // Callbacks outlive the process that initiated the payment, so the
      // aggregate is resolved from its persisted reference, not process memory.
      const paymentRes = await this.paymentRepository.findByGatewayReference(gatewayRefRes.value);
      if (paymentRes.isFailure) {
        throw new Error(`Payment aggregate associated with gateway reference ${gatewayReference} not found.`);
      }

      // Duplicate deliveries can arrive concurrently; the lock plus reload makes
      // the confirmation and its reconciliation happen exactly once.
      const paymentId = paymentRes.value.id.value;
      await this.lockPaymentRow(paymentId);
      const lockedRes = await this.paymentRepository.findById(new PaymentId(paymentId));
      if (lockedRes.isFailure) {
        throw new Error(`Payment aggregate associated with gateway reference ${gatewayReference} not found.`);
      }

      const payment = lockedRes.value;

      // Capture the gateway's own payment identifier now so later operations
      // (e.g. refunds against a Razorpay `pay_…`) can address the gateway.
      if (gatewayPaymentId) {
        const recordRes = payment.recordGatewayPaymentId(gatewayPaymentId);
        if (recordRes.isFailure) {
          throw new Error(recordRes.error.message);
        }
      }

      // Idempotency: Ignore duplicate webhooks if payment is already confirmed
      if (payment.status === "CONFIRMED") {
        this.logger.info("processPaymentWebhook: Duplicate webhook received. Payment is already CONFIRMED. Ignoring.");
        return payment;
      }

      const attemptId = new UniqueEntityID();

      if (confirmed) {
        const txHash = TransactionHash.create(providerResponse.transactionHash!).value;
        const count = ConfirmationCount.create(1).value;

        const confirmRes = confirmPayment(payment, attemptId, txHash, count);
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
          const ar = await this.loadReceivableForUpdate(invoice.organizationId, invoice.customerId);

          // Ensure obligation is registered in AR
          const registerRes = registerInvoiceObligation(ar, invoice.id, invoice.grandTotal, invoice.dueDate.value);
          if (registerRes.isFailure) {
            throw new Error(`Accounts Receivable booking rejected: ${registerRes.error.message}`);
          }

          // Apply allocation to AR entries
          const settlementId = new SettlementId(payment.id.value);
          const creditPolicy = new CreditAllocationPolicy();
          const applyRes = applyReceivablePayment(
            ar,
            settlementId,
            invoice.id,
            Money.create(allocation.allocatedAmount.amount, allocation.allocatedAmount.currency).value,
            creditPolicy
          );
          if (applyRes.isFailure) {
            throw new Error(`Accounts Receivable booking rejected: ${applyRes.error.message}`);
          }

          const entry = ar.entries.find((candidate) => candidate.invoiceId.equals(invoice.id));
          if (!entry) {
            throw new Error("Accounts Receivable booking rejected: invoice obligation was not registered.");
          }

          const arSaveRes = await this.accountsReceivableRepository.save(ar);
          if (arSaveRes.isFailure) {
            throw new Error(`Failed to persist receivable ledger: ${arSaveRes.error.message}`);
          }

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

          // Payments alone under-count what settled the invoice: credit applied
          // to it moves no payment row. The entry already nets that credit,
          // while the payment sums carry the overpayment that spilled into
          // credit, so the larger of the two views is the paid total.
          const settledByLedger = entry.originalAmount.amount - entry.remainingBalance.amount;
          const paidForStatus = Math.max(cumulativePaid, settledByLedger);

          const cumulativeMoney = Money.create(paidForStatus, invoice.currency).value;
          const recordRes = recordPayment(invoice, cumulativeMoney);
          if (recordRes.isFailure) {
            throw new Error(`Invoice obligation status update failed: ${recordRes.error.message}`);
          }
          const invoiceSaveRes = await this.invoiceRepository.save(invoice);
          if (invoiceSaveRes.isFailure) {
            throw new Error(`Failed to save reconciled invoice: ${invoiceSaveRes.error.message}`);
          }

          // Publish ACOS invoice reconciliation events (e.g. InvoicePaid, InvoicePartiallyPaid, InvoiceOverpaid)
          if (invoice.domainEvents.length > 0) {
            this.logger.info(`Publishing ACOS invoice reconciliation events to the Event Bus: ${invoice.domainEvents.map(e => e.eventName).join(", ")}`);
            await this.eventBus.publishAll(invoice.domainEvents);
            invoice.clearDomainEvents();
          }
        }
        this.logger.info("processPaymentWebhook: Reconciliation completed successfully.");

      } else {
        const failRes = failPayment(
          payment,
          attemptId,
          errorCode || providerResponse.errorCode || "DECLINED",
          errorMessage || providerResponse.errorMessage || "Declined by gateway"
        );
        if (failRes.isFailure) {
          throw new Error(failRes.error.message);
        }
        this.logger.info("processPaymentWebhook: Payment marked as FAILED.");
      }

      const saveRes = await this.paymentRepository.save(payment);
      if (saveRes.isFailure) {
        throw new Error(`Failed to save payment aggregate: ${saveRes.error.message}`);
      }

      const events = payment.domainEvents;
      payment.clearDomainEvents();
      await this.eventBus.publishAll(events);

      return payment;
    });

    const mapper = new PaymentMapper();
    return mapper.map(payment);
  }

  /**
   * Settles an outstanding invoice with the customer's unapplied credit.
   * Amounts are capped by both the invoice's remaining balance and the
   * customer's credit balance; omitting the amount applies as much as possible.
   */
  public async applyCreditToInvoice(userId: string, invoiceId: string, amount?: number): Promise<any> {
    this.logger.info("applyCreditToInvoice: Processing request...", { userId, invoiceId, amount });

    const invoiceRes = await this.invoiceRepository.findById(new InvoiceId(invoiceId));
    if (invoiceRes.isFailure) {
      throw new Error(`Invoice with ID ${invoiceId} not found.`);
    }
    const invoice = invoiceRes.value;

    await this.verifyBusinessOwnership(userId, invoice.organizationId.value);

    const isCollectable = invoice.sentAt !== null && (invoice.status === "ISSUED" || invoice.status === "PARTIALLY_PAID");
    if (!isCollectable) {
      throw new Error("Credit application rejected: Credit can only be applied to SENT invoices awaiting payment.");
    }
    if (amount !== undefined && (typeof amount !== "number" || amount <= 0)) {
      throw new Error("Credit application amount must be a positive number.");
    }

    return this.withinTransaction(async () => {
      const ar = await this.loadReceivableForUpdate(invoice.organizationId, invoice.customerId);

      // The eligibility checks above read an unlocked snapshot; re-read the
      // invoice under the ledger lock so the decision and the write agree.
      const lockedRes = await this.invoiceRepository.findById(invoice.id);
      if (lockedRes.isFailure) {
        throw new Error(`Invoice with ID ${invoiceId} not found.`);
      }
      const lockedInvoice = lockedRes.value;
      const stillCollectable = lockedInvoice.sentAt !== null && (lockedInvoice.status === "ISSUED" || lockedInvoice.status === "PARTIALLY_PAID");
      if (!stillCollectable) {
        throw new Error("Credit application rejected: Credit can only be applied to SENT invoices awaiting payment.");
      }

      const registerRes = registerInvoiceObligation(ar, lockedInvoice.id, lockedInvoice.grandTotal, lockedInvoice.dueDate.value);
      if (registerRes.isFailure) {
        throw new Error(`Accounts Receivable booking rejected: ${registerRes.error.message}`);
      }

      const entry = ar.entries.find((candidate) => candidate.invoiceId.equals(lockedInvoice.id));
      if (!entry) {
        throw new Error("Accounts Receivable booking rejected: invoice obligation was not registered.");
      }

      const requested = amount ?? Math.min(ar.getCreditBalance(lockedInvoice.currency).amount, entry.remainingBalance.amount);
      if (requested <= 0) {
        throw new Error("Credit application rejected: the customer has no available credit in the invoice currency.");
      }

      const applyRes = applyCustomerCredit(ar, lockedInvoice.id, Money.create(requested, lockedInvoice.currency).value);
      if (applyRes.isFailure) {
        throw new Error(`Accounts Receivable credit application rejected: ${applyRes.error.message}`);
      }

      const arSaveRes = await this.accountsReceivableRepository.save(ar);
      if (arSaveRes.isFailure) {
        throw new Error(`Failed to persist receivable ledger: ${arSaveRes.error.message}`);
      }

      // Credit settlements leave no Payment row, so the invoice's paid amount is
      // re-derived from its receivable entry instead of gateway allocations.
      const netPaid = lockedInvoice.grandTotal.amount - entry.remainingBalance.amount;
      const recordRes = recordPayment(lockedInvoice, Money.create(netPaid, lockedInvoice.currency).value);
      if (recordRes.isFailure) {
        throw new Error(`Invoice obligation status update failed: ${recordRes.error.message}`);
      }
      const invoiceSaveRes = await this.invoiceRepository.save(lockedInvoice);
      if (invoiceSaveRes.isFailure) {
        throw new Error(`Failed to save reconciled invoice: ${invoiceSaveRes.error.message}`);
      }

      if (lockedInvoice.domainEvents.length > 0) {
        this.logger.info(`Publishing ACOS invoice credit-application events to the Event Bus: ${lockedInvoice.domainEvents.map(e => e.eventName).join(", ")}`);
        await this.eventBus.publishAll(lockedInvoice.domainEvents);
        lockedInvoice.clearDomainEvents();
      }

      return {
        invoiceId: lockedInvoice.id.value,
        amountApplied: requested,
        invoiceStatus: lockedInvoice.status,
        outstandingBalance: entry.remainingBalance.amount,
        creditBalance: ar.getCreditBalance(lockedInvoice.currency).amount
      };
    });
  }

  /**
   * Returns money on a confirmed payment. The refund request is committed as
   * a durable reservation before the gateway is called, so overlapping
   * requests cannot both pass the cap check and reach the gateway; the ledger
   * reversal commits in its own transaction once the gateway settles.
   */
  public async refundPayment(userId: string, paymentId: string, amount: number, reason: string): Promise<any> {
    this.logger.info("refundPayment: Processing refund request...", { userId, paymentId, amount });

    const existingRes = await this.paymentRepository.findById(new PaymentId(paymentId));
    if (existingRes.isFailure) {
      throw new Error(`Payment with ID ${paymentId} not found.`);
    }
    const existing = existingRes.value;

    await this.verifyBusinessOwnership(userId, existing.organizationId.value);

    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("Refund amount must be a positive number.");
    }

    this.assertRefundAllowed(existing, amount);

    // Minted up front so the provider can echo it back in gateway notes and
    // asynchronous refund webhooks can be matched to this exact request.
    const refundId = new UniqueEntityID();

    // Reserve the capacity durably before any gateway I/O: the committed
    // REQUESTED refund makes an overlapping request fail the in-transaction
    // cap check instead of both refunds reaching the gateway.
    const reservation = await this.withinTransaction(async () => {
      // Serialize reservations per payment: the row lock makes the cap check
      // and the refund insert atomic across concurrent connections.
      await this.lockPaymentRow(paymentId);

      const reloadRes = await this.paymentRepository.findById(new PaymentId(paymentId));
      if (reloadRes.isFailure) {
        throw new Error(`Payment with ID ${paymentId} not found.`);
      }
      const payment = reloadRes.value;

      const refundMoney = Money.create(amount, payment.amount.currency).value;

      const requestRes = requestRefund(payment, refundId, refundMoney, reason);
      if (requestRes.isFailure) {
        throw new Error(requestRes.error.message);
      }

      const saveRes = await this.paymentRepository.save(payment);
      if (saveRes.isFailure) {
        throw new Error(`Failed to save payment aggregate: ${saveRes.error.message}`);
      }

      // Stamp the row as written under the reserve-before-submit protocol in
      // the reservation transaction itself, so the stale sweep can tell it
      // apart from a pre-upgrade row that may already have reached the gateway.
      await this.stampRefundReservationProtocol(refundId.value);

      const events = payment.domainEvents;
      payment.clearDomainEvents();
      await this.eventBus.publishAll(events);

      return payment;
    });

    // Mark the reservation as submitted before any gateway I/O. The invariant
    // is: REQUESTED means the gateway was never called; APPROVED means it may
    // have been. Crash recovery may release the former but never the latter.
    await this.markRefundSubmitted(paymentId, refundId);

    // Gateway I/O stays outside the unit of work so no DB transaction is held
    // open across an external call.
    let providerResponse: RefundResponse;
    try {
      providerResponse = await this.paymentProvider.refundPayment({
        paymentId,
        gatewayPaymentId: existing.gatewayPaymentId ?? undefined,
        refundRequestId: refundId.value,
        amount,
        currency: existing.amount.currency,
        reason
      });
    } catch (err) {
      if (err instanceof RefundOutcomeUnknownError) {
        // The gateway may have accepted the refund; releasing the reservation
        // could let a retry create a second gateway refund. The refund is
        // pending, not failed — report it as pending so the caller does not
        // retry, and let the refund webhook or manual reconciliation settle it.
        this.logger.warn(
          "refundPayment: Gateway outcome unknown; keeping the refund reservation pending for the refund webhook or manual reconciliation.",
          { paymentId, refundId: refundId.value, error: err.message }
        );
        const reloadRes = await this.paymentRepository.findById(new PaymentId(paymentId));
        const pending = reloadRes.isSuccess ? reloadRes.value : reservation;
        return new PaymentMapper().map(pending);
      }
      await this.releaseRefundReservation(paymentId, refundId);
      throw err;
    }

    if (providerResponse.status === "FAILED") {
      await this.releaseRefundReservation(paymentId, refundId);
      throw new Error(providerResponse.errorMessage || "Gateway refused the refund.");
    }

    if (providerResponse.status === "PROCESSING") {
      // The gateway accepted the refund but has not moved the money yet.
      // The reservation stays APPROVED and the ledger reversal is deferred
      // to the refund webhook, which calls processRefundWebhook.
      this.logger.info("refundPayment: Refund awaiting gateway processing; reversal deferred to webhook.", {
        paymentId,
        refundId: refundId.value
      });
      return new PaymentMapper().map(reservation);
    }

    const payment = await this.withinTransaction(async () => {
      // The refund webhook may settle this reservation concurrently; the row
      // lock makes the status check below authoritative.
      await this.lockPaymentRow(paymentId);

      const reloadRes = await this.paymentRepository.findById(new PaymentId(paymentId));
      if (reloadRes.isFailure) {
        throw new Error(`Payment with ID ${paymentId} not found.`);
      }
      const payment = reloadRes.value;

      const settledRefund = payment.refundRequests.find((r) => r.id.value === refundId.value);
      if (!settledRefund) {
        throw new Error(`Refund request ${refundId.value} not found on payment ${paymentId}.`);
      }

      // The refund webhook may have settled this reservation first.
      if (settledRefund.status !== RefundStatus.COMPLETED) {
        const completeRes = completeRefund(payment, refundId);
        if (completeRes.isFailure) {
          throw new Error(completeRes.error.message);
        }
        this.logger.info("refundPayment: Refund marked as COMPLETED.", { paymentId, refundId: refundId.value });

        await this.reconcileRefundReversal(payment, settledRefund.amount.amount);

        const saveRes = await this.paymentRepository.save(payment);
        if (saveRes.isFailure) {
          throw new Error(`Failed to save payment aggregate: ${saveRes.error.message}`);
        }

        const events = payment.domainEvents;
        payment.clearDomainEvents();
        await this.eventBus.publishAll(events);
      }

      return payment;
    });

    const mapper = new PaymentMapper();
    return mapper.map(payment);
  }

  /**
   * Serializes mutations of one payment with a Postgres row lock, so
   * concurrent refund reservations, refund completions and duplicate gateway
   * deliveries cannot both pass their read-then-write checks. The in-memory
   * repositories have a single writer and skip it.
   */
  private async lockPaymentRow(paymentId: string): Promise<void> {
    const db = this.dbClient;
    if (!db || typeof db.$queryRawUnsafe !== "function") return;
    await db.$queryRawUnsafe('SELECT id FROM "Payment" WHERE id = $1 FOR UPDATE', paymentId);
  }

  /**
   * Serializes money movements on one customer's receivable ledger. The
   * customer row exists before any ledger row does, so locking it also covers
   * first-time account creation. Callers must lock the payment first when they
   * touch one, which keeps the acquisition order payment -> ledger everywhere.
   */
  private async lockCustomerLedger(customerId: string): Promise<void> {
    const db = this.dbClient;
    if (!db || typeof db.$queryRawUnsafe !== "function") return;
    await db.$queryRawUnsafe('SELECT id FROM "Customer" WHERE id = $1 FOR UPDATE', customerId);
  }

  /**
   * Locks the customer's ledger and returns its receivable account, opening
   * one on first use. Must be called inside a transaction.
   */
  private async loadReceivableForUpdate(
    organizationId: OrganizationId,
    customerId: CustomerId
  ): Promise<AccountsReceivable> {
    await this.lockCustomerLedger(customerId.value);

    const arRes = await this.accountsReceivableRepository.findByCustomer(organizationId, customerId);
    if (arRes.isSuccess) {
      return arRes.value;
    }
    const openRes = openReceivableAccount(organizationId, customerId);
    if (openRes.isFailure) {
      throw new Error(`Failed to open receivable account: ${openRes.error.message}`);
    }
    return openRes.value;
  }

  /**
   * Marks a refund row as written under the reserve-before-submit protocol.
   * Rows that predate the protocol keep the column default, so the sweep never
   * releases a legacy REQUESTED refund whose gateway call may already have run.
   */
  private async stampRefundReservationProtocol(refundId: string): Promise<void> {
    const db = this.dbClient;
    if (!db || typeof db.$executeRawUnsafe !== "function") return;
    await db.$executeRawUnsafe('UPDATE "Refund" SET "submissionProtocol" = 1 WHERE id = $1', refundId);
  }

  /**
   * Transitions the reservation to APPROVED before the gateway call. After a
   * crash, REQUESTED refunds provably never reached the gateway, while
   * APPROVED refunds may have, so only the former can be released by the
   * stale-reservation sweep.
   */
  private async markRefundSubmitted(paymentId: string, refundId: UniqueEntityID): Promise<void> {
    await this.withinTransaction(async () => {
      // Serialize with the stale-reservation sweep so it cannot reject this
      // reservation between the reload and the save.
      await this.lockPaymentRow(paymentId);

      const reloadRes = await this.paymentRepository.findById(new PaymentId(paymentId));
      if (reloadRes.isFailure) {
        throw new Error(`Payment with ID ${paymentId} not found.`);
      }
      const payment = reloadRes.value;

      const approveRes = approveRefund(payment, refundId);
      if (approveRes.isFailure) {
        throw new Error(approveRes.error.message);
      }

      const saveRes = await this.paymentRepository.save(payment);
      if (saveRes.isFailure) {
        throw new Error(`Failed to save payment aggregate: ${saveRes.error.message}`);
      }
    });
  }

  /**
   * Releases a reservation whose gateway call definitively failed (refused or
   * rejected before acceptance) so its amount stops counting against the
   * refund cap. Never masks the original gateway error. Refunds in APPROVED
   * are released too: the approval only marks the attempt, not the outcome.
   */
  private async releaseRefundReservation(paymentId: string, refundId: UniqueEntityID): Promise<void> {
    try {
      await this.withinTransaction(async () => {
        // Serialize with the sweep and the submission marker so the reload
        // below sees a settled status.
        await this.lockPaymentRow(paymentId);

        const reloadRes = await this.paymentRepository.findById(new PaymentId(paymentId));
        if (reloadRes.isFailure) {
          this.logger.warn("refundPayment: Could not reload payment to release the refund reservation.", {
            paymentId,
            refundId: refundId.value
          });
          return;
        }
        const payment = reloadRes.value;

        const refund = payment.refundRequests.find((r) => r.id.value === refundId.value);
        if (!refund || (refund.status !== RefundStatus.REQUESTED && refund.status !== RefundStatus.APPROVED)) {
          return;
        }

        const rejectRes = rejectRefund(payment, refundId);
        if (rejectRes.isFailure) {
          this.logger.warn("refundPayment: Failed to reject the refund reservation.", {
            paymentId,
            refundId: refundId.value,
            error: rejectRes.error.message
          });
          return;
        }

        const saveRes = await this.paymentRepository.save(payment);
        if (saveRes.isFailure) {
          throw new Error(`Failed to save payment aggregate: ${saveRes.error.message}`);
        }

        const events = payment.domainEvents;
        payment.clearDomainEvents();
        await this.eventBus.publishAll(events);
      });
    } catch (err: any) {
      this.logger.warn("refundPayment: Could not release the refund reservation after a gateway failure.", {
        paymentId,
        refundId: refundId.value,
        error: err.message
      });
    }
  }

  /**
   * Releases refund reservations whose process died between the reservation
   * commit and the gateway call. The REQUESTED → APPROVED transition commits
   * before any gateway I/O, so a REQUESTED refund older than `maxAgeMs`
   * provably never reached the gateway and its capacity can be reclaimed.
   * APPROVED reservations are never released here — the gateway may have
   * accepted them — they are only logged for reconciliation.
   */
  public async sweepStaleRefundReservations(maxAgeMs: number = STALE_REFUND_RESERVATION_MS): Promise<number> {
    if (!this.prismaClient) return 0;
    const cutoff = new Date(Date.now() - maxAgeMs);

    const staleRequested = await this.prismaClient.refund.findMany({
      // Only reservations written under the reserve-before-submit protocol are
      // safe to release: a legacy REQUESTED row may already have reached the
      // gateway and keeps the column default.
      where: { status: "REQUESTED", createdAt: { lt: cutoff }, submissionProtocol: 1 }
    });

    let released = 0;
    for (const row of staleRequested) {
      await this.withinTransaction(async () => {
        // Serialize with the submission marker: if a worker is approving this
        // reservation right now, the reload below sees APPROVED and skips it.
        await this.lockPaymentRow(row.paymentId);

        const paymentRes = await this.paymentRepository.findById(new PaymentId(row.paymentId));
        if (paymentRes.isFailure) {
          this.logger.warn("sweepStaleRefundReservations: payment not found for a stale refund.", {
            refundId: row.id,
            paymentId: row.paymentId
          });
          return;
        }
        const payment = paymentRes.value;
        const refund = payment.refundRequests.find((r) => r.id.value === row.id);
        if (!refund || refund.status !== RefundStatus.REQUESTED) {
          return;
        }

        const rejectRes = rejectRefund(payment, new UniqueEntityID(row.id));
        if (rejectRes.isFailure) {
          this.logger.warn("sweepStaleRefundReservations: failed to reject a stale reservation.", {
            refundId: row.id,
            error: rejectRes.error.message
          });
          return;
        }

        const saveRes = await this.paymentRepository.save(payment);
        if (saveRes.isFailure) {
          throw new Error(`Failed to save payment aggregate: ${saveRes.error.message}`);
        }
        const events = payment.domainEvents;
        payment.clearDomainEvents();
        await this.eventBus.publishAll(events);
        released += 1;
      });
    }

    if (released > 0) {
      this.logger.info("sweepStaleRefundReservations: released stale refund reservations.", { released });
    }

    const unresolved = await this.prismaClient.refund.findMany({
      where: { status: "APPROVED", createdAt: { lt: cutoff } }
    });
    for (const row of unresolved) {
      this.logger.warn(
        "sweepStaleRefundReservations: an APPROVED refund is unresolved and needs reconciliation. Verify with the gateway that no refund exists for this request id, then call releaseUnsubmittedRefundReservation.",
        { refundId: row.id, paymentId: row.paymentId }
      );
    }

    return released;
  }

  /** Re-runs the stale-reservation sweep while the process is up. */
  private scheduleRefundReservationSweep(): void {
    if (!this.prismaClient || this.refundSweepTimer) return;
    this.refundSweepTimer = setInterval(() => {
      this.sweepStaleRefundReservations().catch((err: any) =>
        this.logger.warn("Periodic refund-reservation sweep failed.", { error: err.message })
      );
    }, REFUND_SWEEP_INTERVAL_MS);
    this.refundSweepTimer.unref?.();
  }

  /**
   * Operator recovery for an APPROVED reservation whose gateway call never
   * started (the process stopped between the submission marker and the gateway
   * request) — a crash the automatic sweep deliberately never releases.
   * The caller MUST first confirm against the gateway that no refund exists
   * for this request id: for Razorpay, list the payment's refunds and check the
   * `notes.refundRequestId` echoed on each one. Returns true when the
   * reservation was released and its capacity reclaimed.
   */
  public async releaseUnsubmittedRefundReservation(paymentId: string, refundRequestId: string): Promise<boolean> {
    return this.withinTransaction(async () => {
      await this.lockPaymentRow(paymentId);

      const reloadRes = await this.paymentRepository.findById(new PaymentId(paymentId));
      if (reloadRes.isFailure) {
        this.logger.warn("releaseUnsubmittedRefundReservation: payment not found.", { paymentId, refundRequestId });
        return false;
      }
      const payment = reloadRes.value;

      const refund = payment.refundRequests.find((r) => r.id.value === refundRequestId);
      if (!refund || (refund.status !== RefundStatus.REQUESTED && refund.status !== RefundStatus.APPROVED)) {
        this.logger.warn("releaseUnsubmittedRefundReservation: refund is not open.", {
          paymentId,
          refundRequestId,
          status: refund?.status ?? null
        });
        return false;
      }

      const rejectRes = rejectRefund(payment, new UniqueEntityID(refundRequestId));
      if (rejectRes.isFailure) {
        this.logger.warn("releaseUnsubmittedRefundReservation: failed to reject the reservation.", {
          paymentId,
          refundRequestId,
          error: rejectRes.error.message
        });
        return false;
      }

      const saveRes = await this.paymentRepository.save(payment);
      if (saveRes.isFailure) {
        throw new Error(`Failed to save payment aggregate: ${saveRes.error.message}`);
      }
      const events = payment.domainEvents;
      payment.clearDomainEvents();
      await this.eventBus.publishAll(events);
      this.logger.info("releaseUnsubmittedRefundReservation: released an unsubmitted refund reservation.", {
        paymentId,
        refundRequestId
      });
      return true;
    });
  }

  /**
   * Pre-flight mirror of the kernel's refund guards, compared in normalized
   * minor units so float arithmetic (e.g. 0.1 + 0.2) cannot reject a valid
   * refund. The in-transaction requestRefund check remains authoritative.
   */
  private assertRefundAllowed(payment: Payment, amount: number): void {
    if (payment.status !== PaymentStatus.CONFIRMED && payment.status !== PaymentStatus.REFUND_REQUESTED) {
      throw new Error("Refunds can only be requested on confirmed payments.");
    }

    const refundMoney = Money.create(amount, payment.amount.currency).value;
    const activeRefundMinorUnits = payment.refundRequests.reduce(
      (total, refund) => (refund.status === RefundStatus.REJECTED ? total : total + refund.amount.minorUnits),
      0
    );
    if (refundMoney.minorUnits + activeRefundMinorUnits > payment.amount.value.minorUnits) {
      throw new Error("Refund requests total cannot exceed payment amount.");
    }
  }

  /**
   * Re-opens the receivable and re-evaluates the invoice obligation for every
   * allocation the refunded payment settles. Shared by the synchronous refund
   * path and the asynchronous refund webhook completion.
   */
  private async reconcileRefundReversal(payment: Payment, amount: number): Promise<void> {
    const currency = payment.amount.currency;

    // The receivable ledger hangs off the customer, and a persisted payment
    // row carries no customer id, so the settlement target supplies it.
    const firstAllocation = payment.allocations[0];
    if (!firstAllocation) {
      throw new Error("Refund reversal requires the payment to settle at least one invoice.");
    }
    const anchorInvoice = await this.loadReversalInvoice(
      payment,
      firstAllocation.invoiceId,
      firstAllocation.allocatedAmount.currency
    );

    const ar = await this.loadReceivableForUpdate(anchorInvoice.organizationId, anchorInvoice.customerId);

    // 1. Return what this payment never applied. An overpayment is booked as
    // customer credit, so refunding it must not re-open the settled invoice.
    const creditRes = refundCustomerCredit(
      ar,
      new SettlementId(payment.id.value),
      Money.create(amount, currency).value
    );
    if (creditRes.isFailure) {
      throw new Error(`Accounts Receivable credit refund rejected: ${creditRes.error.message}`);
    }
    const { consumed, remainder: remainderMoney, shares } = creditRes.value;
    let arDirty = consumed.amount > 0;

    // Invoice status is derived from the total refunded against it, so credit
    // and obligation portions are merged into one update per invoice.
    const refundedByInvoice = new Map<string, { invoice: Invoice; amount: number }>();
    const addInvoiceRefund = (invoice: Invoice, invoiceAmount: number): void => {
      const existing = refundedByInvoice.get(invoice.id.value);
      if (existing) {
        existing.amount += invoiceAmount;
      } else {
        refundedByInvoice.set(invoice.id.value, { invoice, amount: invoiceAmount });
      }
    };

    for (const share of shares) {
      const invoice = await this.loadReversalInvoice(
        payment,
        share.invoiceId,
        currency,
        anchorInvoice.customerId
      );
      addInvoiceRefund(invoice, share.amount.amount);
    }

    // 2. Re-open the obligations the payment actually settled.
    let remainingRefund = remainderMoney.amount;
    for (const allocation of payment.allocations) {
      // Refund requests are payment-level; distribute the refunded value
      // across allocations (the persisted merchant payment has one).
      const allocationRefund = Math.min(remainingRefund, allocation.allocatedAmount.amount);
      if (allocationRefund <= 0) break;
      remainingRefund -= allocationRefund;

      const invoice = await this.loadReversalInvoice(
        payment,
        allocation.invoiceId,
        allocation.allocatedAmount.currency,
        anchorInvoice.customerId
      );

      const applyRes = applyRefund(ar, invoice.id, Money.create(allocationRefund, currency).value);
      if (applyRes.isFailure) {
        throw new Error(`Accounts Receivable refund rejected: ${applyRes.error.message}`);
      }
      arDirty = true;

      addInvoiceRefund(invoice, allocationRefund);
    }

    if (arDirty) {
      const arSaveRes = await this.accountsReceivableRepository.save(ar);
      if (arSaveRes.isFailure) {
        throw new Error(`Failed to persist receivable ledger: ${arSaveRes.error.message}`);
      }
    }

    for (const { invoice, amount: invoiceRefund } of refundedByInvoice.values()) {
      await this.recordInvoiceRefund(payment, invoice, Money.create(invoiceRefund, invoice.currency).value);
    }
    this.logger.info("refundPayment: Reversal reconciliation completed successfully.");
  }

  private async loadReversalInvoice(
    payment: Payment,
    invoiceId: InvoiceId,
    currency: string,
    expectedCustomerId?: CustomerId
  ): Promise<Invoice> {
    const invoiceRes = await this.invoiceRepository.findById(invoiceId);
    if (invoiceRes.isFailure) {
      throw new Error(`Refund reversal target not found: Invoice ${invoiceId.value} not found.`);
    }
    const invoice = invoiceRes.value;

    // Tenant Boundary Isolation Check
    if (invoice.organizationId.value !== payment.organizationId.value) {
      throw new Error("Access Denied: Cross-tenant boundary breach. Confirmed payment cannot be reconciled against another merchant's invoice.");
    }
    // Every reversal target must share the customer whose ledger is re-opened.
    if (expectedCustomerId && invoice.customerId.value !== expectedCustomerId.value) {
      throw new Error("Access Denied: Cross-customer boundary breach. Refund reversal cannot reconcile another customer's invoice.");
    }

    // Currency Validation
    if (invoice.currency !== currency) {
      throw new Error(`Reconciliation Mismatch: Invoice currency ${invoice.currency} does not match refund currency ${currency}.`);
    }
    return invoice;
  }

  private async recordInvoiceRefund(payment: Payment, invoice: Invoice, refunded: Money): Promise<void> {
    // Update Invoice Obligation Status from cumulative net payments.
    const allPaymentsRes = await this.paymentRepository.findByInvoice(invoice.organizationId, invoice.id);
    let cumulativePaid = 0;
    let cumulativeRefunded = 0;
    if (allPaymentsRes.isSuccess) {
      for (const p of allPaymentsRes.value) {
        // The current payment is read from the row written by the
        // webhook, so its just-completed refund only exists in memory.
        const isCurrent = p.id.equals(payment.id);
        // Money was collected on confirmed, refund-pending, and fully-refunded
        // payments alike — a pending refund is still held capacity, so its
        // collection must count toward the net paid total.
        if (
          !isCurrent &&
          p.status !== PaymentStatus.CONFIRMED &&
          p.status !== PaymentStatus.REFUND_REQUESTED &&
          p.status !== PaymentStatus.REFUNDED
        )
          continue;
        for (const a of p.allocations) {
          if (a.invoiceId.equals(invoice.id)) {
            cumulativePaid += a.allocatedAmount.amount;
          }
        }
        const refunds = isCurrent ? payment.refundRequests : p.refundRequests;
        for (const r of refunds) {
          if (r.status === RefundStatus.COMPLETED) {
            cumulativeRefunded += r.amount.amount;
          }
        }
      }
    }

    const netPaid = cumulativePaid - cumulativeRefunded;
    const recordRes = recordRefund(invoice, refunded, Money.create(netPaid, invoice.currency).value);
    if (recordRes.isFailure) {
      throw new Error(`Invoice obligation status update failed: ${recordRes.error.message}`);
    }
    const invoiceSaveRes = await this.invoiceRepository.save(invoice);
    if (invoiceSaveRes.isFailure) {
      throw new Error(`Failed to save reconciled invoice: ${invoiceSaveRes.error.message}`);
    }

    // Publish ACOS invoice refund events (e.g. InvoiceRefunded)
    if (invoice.domainEvents.length > 0) {
      this.logger.info(`Publishing ACOS invoice refund events to the Event Bus: ${invoice.domainEvents.map(e => e.eventName).join(", ")}`);
      await this.eventBus.publishAll(invoice.domainEvents);
      invoice.clearDomainEvents();
    }
  }

  /**
   * Settles a refund the gateway processed asynchronously. `refundRequestId`
   * is the internal id the provider sent as a Razorpay refund note, so the
   * event is matched to the exact request that created it. Completion runs
   * the same ledger reversal as the synchronous refund path, in one
   * transaction; a declined refund is rejected so its amount stops holding
   * against the refund cap.
   */
  public async processRefundWebhook(
    paymentId: string,
    refundRequestId: string,
    success: boolean,
    errorCode?: string,
    errorMessage?: string
  ): Promise<any> {
    this.logger.info("processRefundWebhook: Processing refund webhook...", { paymentId, refundRequestId, success });

    const existingRes = await this.paymentRepository.findById(new PaymentId(paymentId));
    if (existingRes.isFailure) {
      throw new Error(`Payment with ID ${paymentId} not found.`);
    }
    const existing = existingRes.value;
    const knownRefund = existing.refundRequests.find((r) => r.id.value === refundRequestId);
    if (!knownRefund) {
      throw new Error(`Refund request ${refundRequestId} not found on payment ${paymentId}.`);
    }

    // Idempotency: re-delivered webhooks for a terminal refund are acknowledged.
    if (knownRefund.status === RefundStatus.COMPLETED || (!success && knownRefund.status === RefundStatus.REJECTED)) {
      this.logger.info("processRefundWebhook: Duplicate webhook for a terminal refund. Ignoring.");
      const mapper = new PaymentMapper();
      return mapper.map(existing);
    }

    const payment = await this.withinTransaction(async () => {
      // The synchronous refund response may settle this refund concurrently;
      // the row lock makes the status re-check below authoritative.
      await this.lockPaymentRow(paymentId);

      const reloadRes = await this.paymentRepository.findById(new PaymentId(paymentId));
      if (reloadRes.isFailure) {
        throw new Error(`Payment with ID ${paymentId} not found.`);
      }
      const payment = reloadRes.value;
      const refundId = new UniqueEntityID(refundRequestId);

      // The synchronous settlement path may have completed this refund between
      // the pre-check and this transaction; the reversal must run only on the
      // transition, never on an already-settled or already-rejected refund.
      const current = payment.refundRequests.find((r) => r.id.value === refundRequestId);
      if (!current) {
        throw new Error(`Refund request ${refundRequestId} not found on payment ${paymentId}.`);
      }
      if (current.status === RefundStatus.COMPLETED) {
        this.logger.info("processRefundWebhook: Refund already completed; acknowledging without another reversal.", {
          paymentId,
          refundRequestId
        });
        return payment;
      }
      if (!success && current.status === RefundStatus.REJECTED) {
        this.logger.info("processRefundWebhook: Refund already rejected; acknowledging.", { paymentId, refundRequestId });
        return payment;
      }

      if (success) {
        const completeRes = completeRefund(payment, refundId);
        if (completeRes.isFailure) {
          throw new Error(completeRes.error.message);
        }
        this.logger.info("processRefundWebhook: Refund marked as COMPLETED.", { paymentId, refundRequestId });

        const settledRefund = payment.refundRequests.find((r) => r.id.value === refundRequestId);
        await this.reconcileRefundReversal(payment, settledRefund!.amount.amount);
      } else {
        const rejectRes = rejectRefund(payment, refundId);
        if (rejectRes.isFailure) {
          throw new Error(rejectRes.error.message);
        }
        this.logger.info("processRefundWebhook: Refund marked as REJECTED.", {
          paymentId,
          refundRequestId,
          errorCode,
          errorMessage
        });
      }

      const saveRes = await this.paymentRepository.save(payment);
      if (saveRes.isFailure) {
        throw new Error(`Failed to save payment aggregate: ${saveRes.error.message}`);
      }

      const events = payment.domainEvents;
      payment.clearDomainEvents();
      await this.eventBus.publishAll(events);

      return payment;
    });

    const mapper = new PaymentMapper();
    return mapper.map(payment);
  }

  /**
   * Retrieves single Payment profile details, checking tenant isolation.
   */
  public async getPaymentById(userId: string, paymentId: string): Promise<any> {
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
  public async getPayments(userId: string, orgId: string): Promise<any[]> {
    this.logger.info("getPayments: Listing payments for business...", { userId, orgId });

    await this.verifyBusinessOwnership(userId, orgId);

    const list: Payment[] = [];
    if ("items" in this.paymentRepository) {
      for (const payment of (this.paymentRepository as any).items.values()) {
        if (payment.organizationId.value === orgId) {
          list.push(payment);
        }
      }
    } else {
      const prisma = (this.paymentRepository as any).prisma;
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
  public async getDashboard(userId: string, orgId: string): Promise<any> {
    this.logger.info("getDashboard: Generating business dashboard data...", { userId, orgId });

    await this.verifyBusinessOwnership(userId, orgId);

    // 1. Fetch Invoices
    const invoicesRes = await this.invoiceRepository.findByOrganization(new OrganizationId(orgId));
    if (invoicesRes.isFailure) throw new Error(invoicesRes.error.message);
    const invoices = invoicesRes.value;

    // 2. Fetch Payments
    const payments: Payment[] = [];
    if ("items" in this.paymentRepository) {
      for (const p of (this.paymentRepository as any).items.values()) {
        if (p.organizationId.value === orgId) {
          payments.push(p);
        }
      }
    } else {
      const prisma = (this.paymentRepository as any).prisma;
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
    if (orgRes.isFailure) throw new Error("Organization not found");
    const currency = orgRes.value.settings.defaultCurrency.value;

    let totalOutstanding = 0;
    let totalCredit = 0;

    for (const inv of invoices) {
      const isSent = inv.sentAt !== null;
      if (inv.status === "ISSUED" && isSent) {
        totalOutstanding += inv.grandTotal.amount;
      } else if (inv.status === "PARTIALLY_PAID") {
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
      for (const ar of (this.accountsReceivableRepository as any).items.values()) {
        if (ar.organizationId.value === orgId) {
          totalCredit += getReceivableCreditBalance(ar, currency).amount;
        }
      }
    } else {
      const prisma = (this.accountsReceivableRepository as any).prisma;
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
      issuedCount: invoices.filter(inv => inv.status === "ISSUED" && inv.sentAt === null).length,
      sentCount: invoices.filter(inv => inv.status === "ISSUED" && inv.sentAt !== null).length,
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
  public async checkConnectivity(): Promise<{
    connected: boolean;
    status: string;
    subsystems: Record<string, string>;
    health?: any;
    error?: string;
  }> {
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
    } catch (error: any) {
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
  public async disconnect(): Promise<void> {
    if (this.refundSweepTimer) {
      clearInterval(this.refundSweepTimer);
      this.refundSweepTimer = null;
    }
    if (this.outboxRetryTimer) {
      clearTimeout(this.outboxRetryTimer);
      this.outboxRetryTimer = null;
      this.outboxRetryAt = 0;
    }
    await this.transport?.close();
    if (this.isStarted) {
      this.logger.info("Shutting down ACOS Integration Boundary...");
      await this.runtime.shutdown();
      this.isStarted = false;
      this.isInitialized = false;
      this.logger.info("ACOS Integration Boundary shut down successfully.");
    }
  }
}
