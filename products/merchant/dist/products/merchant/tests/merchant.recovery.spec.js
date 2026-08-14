import { describe, it, expect, beforeAll } from "vitest";
import { Logger } from "../../../backend/src/foundation/logging/Logger.js";
import { Mediator } from "../../../backend/src/application/foundation/pipeline/Mediator.js";
import { SubsystemDescriptor, RuntimeFactory } from "acos-runtime";
import { MerchantConfig } from "../src/configuration/MerchantConfig.js";
import { AcosIntegrationBoundary } from "../src/integration/AcosIntegrationBoundary.js";
import { MerchantBackend } from "../src/backend/MerchantBackend.js";
import { MerchantFrontend } from "../src/frontend/MerchantFrontend.js";
import { PrismaClient } from "@prisma/client";
describe("ACOS Merchant — Track D4 Restart & Recovery Validation Suite", () => {
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
            console.warn("PostgreSQL database is not reachable. Skipping restart & recovery validation tests.");
            return;
        }
    });
    it("should survive application restarts, preserving sessions, idempotency records, and outbox event queues", async () => {
        if (!isDbAvailable) {
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
            port: 9006, // Different port to avoid collision
            env: "test-recovery",
            acosEndpoint: "http://localhost:3000",
            dbUrl: dbUrl,
            enableAcosFeatures: true
        });
        // 4. Initial Start
        const boundaryLogger = new Logger("AcosDbBoundary", writer);
        boundary = new AcosIntegrationBoundary(boundaryLogger, runtimeFactory);
        backend = new MerchantBackend(config, boundary, writer);
        frontend = new MerchantFrontend(backend, writer);
        await boundary.connect("test", dbUrl);
        await backend.start();
        // 5. Setup state: User signup and login
        const email = `recovery_${Date.now()}@example.com`;
        const password = "password123";
        const name = "Recovery Merchant";
        const user = await frontend.signUp(email, password, name);
        expect(user.email).toBe(email);
        await frontend.login(email, password);
        const tokenBeforeRestart = frontend.getSessionToken();
        expect(tokenBeforeRestart).toBeDefined();
        // Onboard business
        const biz = await frontend.onboardBusiness("Recovery Shop", `rec-shop-${Date.now()}`, "USD");
        expect(biz.name).toBe("Recovery Shop");
        // Create customer
        const customer = await frontend.createCustomer({
            name: "Bob Recovery",
            customerNumber: `CUST-REC-${Date.now()}`,
            primaryContact: {
                name: "Bob Recovery",
                email: "bob@example.com",
                phone: "+1-555-0299"
            },
            billingAddress: {
                line1: "123 Recovery St",
                city: "Metropolis",
                state: "NY",
                country: "USA",
                postalCode: "10001"
            }
        });
        expect(customer.name).toBe("Bob Recovery");
        // 6. Create idempotency record
        const idempotencyKey = `idemp-rec-${Date.now()}`;
        const idempResponse = await backend.handleRequest("POST", "/auth/signup", {
            email: `idemp_rec_user_${Date.now()}@example.com`,
            password: "pass",
            name: "Idemp Rec"
        }, { "Idempotency-Key": idempotencyKey });
        expect(idempResponse.status).toBe(201);
        // 7. Create outbox event by issuing invoice (which triggers outbox write)
        const invoice = await frontend.createInvoice({
            customerId: customer.id,
            invoiceNumber: `INV-REC-${Date.now()}`,
            currency: "USD",
            paymentTerms: "NET_30",
            issueDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            lines: [
                { description: "Recovery Services", quantity: 1, unitPrice: 150, taxRate: 0 }
            ]
        });
        expect(invoice.status).toBe("DRAFT");
        const prisma = boundary.prismaClient;
        const initialOutboxCount = await prisma.outboxEvent.count();
        expect(initialOutboxCount).toBeGreaterThan(0);
        // 8. SIMULATE RESTART (Stop backend and boundary, then rebuild them)
        await backend.stop();
        await boundary.disconnect();
        const runtimeFactory2 = new RuntimeFactory();
        const backendMediator2 = new Mediator();
        runtimeFactory2.registry.register(new SubsystemDescriptor("backend", [], backendMediator2));
        runtimeFactory2.health.registerCheck("backend", async () => ({
            name: "backend",
            healthy: true
        }));
        boundary = new AcosIntegrationBoundary(boundaryLogger, runtimeFactory2);
        backend = new MerchantBackend(config, boundary, writer);
        frontend = new MerchantFrontend(backend, writer);
        // Restore session token to simulate client retaining its cookie/header
        frontend.sessionToken = tokenBeforeRestart;
        await boundary.connect("test", dbUrl);
        await backend.start();
        // 9. Verify Active Session Survival
        const me = await frontend.queryMe();
        expect(me.email).toBe(email);
        // 10. Verify Idempotency Record Survival
        // Replaying exact signup request should return the cached response (201) instead of 409
        const replayedResponse = await backend.handleRequest("POST", "/auth/signup", {
            email: `idemp_rec_user_${Date.now()}@example.com`,
            password: "pass",
            name: "Idemp Rec"
        }, { "Idempotency-Key": idempotencyKey });
        expect(replayedResponse.status).toBe(201);
        const firstBody = typeof idempResponse.body === "string" ? JSON.parse(idempResponse.body) : idempResponse.body;
        const replayedBody = typeof replayedResponse.body === "string" ? JSON.parse(replayedResponse.body) : replayedResponse.body;
        expect(replayedBody.id).toBe(firstBody.id);
        // 11. Verify Outbox Event Queue is active and processes events post-restart
        await frontend.issueInvoice(invoice.id);
        await frontend.sendInvoice(invoice.id);
        const sentInvoice = await frontend.getInvoice(invoice.id);
        expect(sentInvoice.status).toBe("SENT");
        // Clean up
        await backend.stop();
        await boundary.disconnect();
    });
});
