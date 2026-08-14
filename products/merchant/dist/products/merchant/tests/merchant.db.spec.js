import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Logger } from "../../../backend/src/foundation/logging/Logger.js";
import { Mediator } from "../../../backend/src/application/foundation/pipeline/Mediator.js";
import { SubsystemDescriptor, RuntimeFactory } from "acos-runtime";
import { MerchantConfig } from "../src/configuration/MerchantConfig.js";
import { AcosIntegrationBoundary } from "../src/integration/AcosIntegrationBoundary.js";
import { MerchantBackend } from "../src/backend/MerchantBackend.js";
import { MerchantFrontend } from "../src/frontend/MerchantFrontend.js";
import { PrismaClient } from "@prisma/client";
describe("ACOS Merchant — Track D3 Real PostgreSQL Validation Suite", () => {
    const logs = [];
    const writer = (entry) => {
        logs.push(entry);
    };
    const dbUrl = process.env.MERCHANT_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/acos?schema=public";
    let boundary;
    let backend;
    let frontend;
    let isDbAvailable = false;
    beforeAll(async () => {
        // 1. Check if database is reachable
        const pg = await import("pg");
        const { PrismaPg } = await import("@prisma/adapter-pg");
        const pool = new pg.default.Pool({ connectionString: dbUrl });
        const adapter = new PrismaPg(pool);
        const prisma = new PrismaClient({ adapter });
        try {
            await prisma.$connect();
            await prisma.$queryRaw `SELECT 1`;
            await prisma.$disconnect();
            isDbAvailable = true;
        }
        catch (err) {
            console.warn("PostgreSQL database is not reachable or database does not exist. Skipping real PostgreSQL validation tests.");
            return;
        }
        // 2. Setup ACOS Runtime Subsystems Mock Factory
        const runtimeFactory = new RuntimeFactory();
        const backendMediator = new Mediator();
        runtimeFactory.registry.register(new SubsystemDescriptor("backend", [], backendMediator));
        runtimeFactory.health.registerCheck("backend", async () => ({
            name: "backend",
            healthy: true
        }));
        // 3. Load config
        const config = MerchantConfig.loadFromEnv({
            port: 9005, // Different port to avoid collision
            env: "test-db",
            acosEndpoint: "http://localhost:3000",
            dbUrl: dbUrl,
            enableAcosFeatures: true
        });
        const boundaryLogger = new Logger("AcosDbBoundary", writer);
        boundary = new AcosIntegrationBoundary(boundaryLogger, runtimeFactory);
        backend = new MerchantBackend(config, boundary, writer);
        frontend = new MerchantFrontend(backend, writer);
        // Bootstrap with real dbUrl
        await boundary.connect("test", dbUrl);
        await backend.start();
    });
    afterAll(async () => {
        if (backend) {
            await backend.stop();
        }
    });
    it("should successfully execute CRUD, Webhooks, Idempotency, and Outbox persistence operations against PostgreSQL", async () => {
        if (!isDbAvailable) {
            // Skip test gracefully if DB is not available
            return;
        }
        // 1. User signup (checks User table)
        const email = `db_valid_${Date.now()}@example.com`;
        const password = "password123";
        const name = "DB Hardened Merchant";
        const user = await frontend.signUp(email, password, name);
        expect(user.email).toBe(email);
        // 2. User login
        await frontend.login(email, password);
        const me = await frontend.queryMe();
        expect(me.email).toBe(email);
        // 3. Business Onboarding (checks Organization & BusinessMetadata table context)
        const biz = await frontend.onboardBusiness("Postgres Shop", `pg-shop-${Date.now()}`, "USD");
        expect(biz.name).toBe("Postgres Shop");
        // 4. Create Customer (checks Customer table)
        const customer = await frontend.createCustomer({
            name: "Alice DB",
            customerNumber: `CUST-DB-${Date.now()}`,
            primaryContact: {
                name: "Alice DB",
                email: "alice@example.com",
                phone: "+1-555-0199"
            },
            billingAddress: {
                line1: "123 Postgres Way",
                city: "Metropolis",
                state: "NY",
                country: "USA",
                postalCode: "10001"
            }
        });
        expect(customer.name).toBe("Alice DB");
        // 5. Create, Issue, and Send Invoice (checks Invoice & InvoiceLineItem table)
        const invoice = await frontend.createInvoice({
            customerId: customer.id,
            invoiceNumber: `INV-DB-${Date.now()}`,
            currency: "USD",
            paymentTerms: "NET_30",
            issueDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            lines: [
                { description: "Database Services", quantity: 1, unitPrice: 100, taxRate: 0 }
            ]
        });
        expect(invoice.status).toBe("DRAFT");
        await frontend.issueInvoice(invoice.id);
        await frontend.sendInvoice(invoice.id);
        const sentInvoice = await frontend.getInvoice(invoice.id);
        expect(sentInvoice.status).toBe("SENT");
        // 6. Collect Payment and process webhook (checks Payment & OutboxEvent & IdempotencyRecord tables)
        const payment = await frontend.collectPayment(invoice.id);
        expect(payment.amount).toBe(100);
        // Find payment record in DB to get gateway reference
        const prisma = boundary.prismaClient;
        const dbPayment = await prisma.payment.findFirst({
            where: { invoiceId: invoice.id }
        });
        expect(dbPayment).toBeDefined();
        const gatewayRef = dbPayment.gatewayReference;
        expect(gatewayRef).toBeDefined();
        // Trigger webhook simulation
        await frontend.simulateWebhook(gatewayRef, true);
        // Verify invoice status updated to PAID (reconciliation completed)
        const finalInvoice = await frontend.getInvoice(invoice.id);
        expect(finalInvoice.status).toBe("PAID");
        // Verify outbox event record was persisted and processed
        const outboxEvt = await prisma.outboxEvent.findFirst({
            where: { eventType: "InvoicePaid" }
        });
        expect(outboxEvt).toBeDefined();
        expect(outboxEvt.processed).toBe(true);
        // Verify idempotency record was created
        const idempotencyKey = `key-${Date.now()}`;
        await backend.handleRequest("POST", "/auth/signup", {
            email: `idemp_db_${Date.now()}@example.com`,
            password: "pass",
            name: "Idemp DB"
        }, { "Idempotency-Key": idempotencyKey });
        const idempRec = await prisma.idempotencyRecord.findUnique({
            where: { key: idempotencyKey }
        });
        expect(idempRec).toBeDefined();
        expect(idempRec.statusCode).toBe(201);
    });
});
