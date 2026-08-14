import { describe, it, expect } from "vitest";
import { DeveloperFactory } from "../factories/DeveloperFactory.js";
import { OpenAPIGenerator } from "../openapi/OpenAPIGenerator.js";
import { PostmanMockServer } from "../postman/PostmanMockServer.js";
import { GraphQLEngine } from "../graphql/GraphQLEngine.js";
import { CompatibilityChecker } from "../migration/CompatibilityChecker.js";
import { UpgradeAssistant } from "../migration/UpgradeAssistant.js";

describe("ACOS Master Developer Platform Integration Tests (developer.integration.spec.ts)", () => {
  const factory = new DeveloperFactory();

  it("should coordinate DocumentationFactory seamlessly", () => {
    const docFactory = factory.documentation;
    const docManager = docFactory.createManager();

    expect(docManager.getApiDoc()).toContain("ACOS Core API Reference");
    expect(docManager.getArchitectureDoc()).toContain("ACOS System Architecture");
    expect(docManager.getSdkDoc()).toContain("ACOS Client SDKs Reference");
    expect(docManager.getTutorials().length).toBeGreaterThan(0);
    expect(docManager.getExamplesDoc()).toContain("ACOS Integration Examples");
  });

  it("should coordinate OpenAPI generator configurations", () => {
    const generator = new OpenAPIGenerator();
    const spec = generator.getOpenAPISpec();

    expect(spec.openapi).toBe("3.0.3");
    expect(spec.paths["/invoices"]).toBeDefined();
    expect(generator.renderSwaggerHtml()).toContain("Swagger UI");
    expect(generator.renderRedocHtml()).toContain("Redoc");

    const invoiceSchema = generator.generateJsonSchema("invoice");
    expect(invoiceSchema.required).toContain("currency");
  });

  it("should coordinate SDKFactory and TypeScript Client SDK operations", async () => {
    const sdkFactory = factory.sdk;
    const sdkManager = sdkFactory.createManager();

    expect(sdkManager.getLanguages()).toContain("typescript");
    expect(sdkManager.getLanguageFilePath("go")).toContain("acos_client.go");

    const client = sdkManager.getTypeScriptClient("test_secret_key");
    const loggedIn = await client.auth.login("test_secret_key");
    expect(loggedIn).toBe(true);

    const invRes = await client.invoices.create({
      organizationId: "org_1",
      customerId: "cust_1",
      invoiceNumber: "INV-100",
      currency: "USD",
      dueDate: new Date()
    });
    expect(invRes.isSuccess).toBe(true);
    expect(invRes.invoiceId).toContain("inv_");

    const refundRes = await client.payments.refund("pay_1", 120.50);
    expect(refundRes.isSuccess).toBe(true);
    expect(refundRes.amount).toBe(120.50);
  });

  it("should coordinate CLIFactory command parsing and execution", async () => {
    const cliFactory = factory.cli;
    const cli = cliFactory.createCLI();

    // 1. Unauthenticated deployment fail
    const deployFail = await cli.execute(["acos", "deploy"]);
    expect(deployFail.code).toBe(1);
    expect(deployFail.output).toContain("login");

    // 2. Login command
    const loginRes = await cli.execute(["acos", "login", "--key", "acos_sec_test_key_12345"]);
    expect(loginRes.code).toBe(0);
    expect(loginRes.output).toContain("Success");

    // 3. Deployment success
    const deployRes = await cli.execute(["acos", "deploy"]);
    expect(deployRes.code).toBe(0);
    expect(deployRes.output).toContain("deployed");

    // 4. Invoice create command
    const invoiceRes = await cli.execute(["acos", "invoice", "create", "--customer", "cust_100", "--amount", "450.00"]);
    expect(invoiceRes.code).toBe(0);
    expect(invoiceRes.output).toContain("inv_cli_");

    // 5. Payment refund command
    const refundRes = await cli.execute(["acos", "payment", "refund", "--payment-id", "pay_200", "--amount", "50.00"]);
    expect(refundRes.code).toBe(0);
    expect(refundRes.output).toContain("ref_cli_");
  });

  it("should coordinate PostmanMockServer and test payload responses", async () => {
    const mockServer = new PostmanMockServer();
    mockServer.start();
    expect(mockServer.getStatus()).toBe(true);

    // 1. Invalid api key reject
    const unauthorizedRes = await mockServer.simulateRequest("POST", "/invoices", { Authorization: "Bearer bad_key" }, {});
    expect(unauthorizedRes.status).toBe(401);

    // 2. Successful creation
    const successRes = await mockServer.simulateRequest(
      "POST",
      "/invoices",
      { Authorization: "Bearer acos_sec_test_key_12345" },
      { organizationId: "org_1", customerId: "cust_1" }
    );
    expect(successRes.status).toBe(200);
    expect(successRes.body.invoiceId).toBe("mock_inv_9999");

    mockServer.stop();
    expect(mockServer.getStatus()).toBe(false);
  });

  it("should execute queries and mutations against GraphQLEngine", async () => {
    const gqlEngine = new GraphQLEngine();
    expect(gqlEngine.getSchema()).toContain("type Query");
    expect(gqlEngine.getFederationSpecs()).toContain("_service");

    const createMutation = `
      mutation CreateInvoice($org: String!, $cust: String!, $num: String!, $cur: String!, $tot: Float!) {
        createInvoice(organizationId: $org, customerId: $cust, invoiceNumber: $num, currency: $cur, grandTotal: $tot) {
          id
          status
        }
      }
    `;
    const res = await gqlEngine.execute(createMutation, {
      organizationId: "org_gql",
      customerId: "cust_gql",
      invoiceNumber: "INV-GQL-77",
      currency: "EUR",
      grandTotal: 99.99
    });

    expect(res.errors).toBeUndefined();
    expect(res.data.createInvoice.status).toBe("DRAFT");
    expect(res.data.createInvoice.id).toContain("inv_gql_");
  });

  it("should check compatibility and execute upgrade assistants for migration", () => {
    const checker = new CompatibilityChecker();
    const assistant = new UpgradeAssistant();

    // v1 incompatible invoice
    const v1Invoice = { organizationId: "org_1", customerId: "cust_1" };
    const check1 = checker.checkPayload(v1Invoice, "invoice");
    expect(check1.isCompatible).toBe(false);
    expect(check1.errors.join(" ")).toContain("currency");

    // Upgrade invoice
    const { v2Payload, upgradesApplied } = assistant.upgradeInvoicePayload(v1Invoice);
    expect(v2Payload.currency).toBe("USD");
    expect(upgradesApplied.length).toBeGreaterThan(0);

    // Recheck upgraded payload
    const check2 = checker.checkPayload(v2Payload, "invoice");
    expect(check2.isCompatible).toBe(true);
  });

  it("should generate models, APIs, and SDK code via GeneratorFactory", () => {
    const generatorFactory = factory.generator;
    const generator = generatorFactory.createGenerator();

    expect(generator.generateSDK("python")).toContain("Generated SDK for python");
    expect(generator.generateAPIClient("go")).toContain("Generated API Client for go");
    expect(generator.generateModels("typescript")).toContain("Generated Models for typescript");
    expect(generator.generateTypes("dotnet")).toContain("Generated Types for dotnet");
    expect(generator.generateBoilerplate("java")).toContain("Generated Boilerplate App for java");
  });

  it("should execute simulation utilities in PlaygroundFactory", async () => {
    const playgroundFactory = factory.playground;
    const playgroundManager = playgroundFactory.createManager();

    // 1. API Explorer
    const expRes = await playgroundManager.explorer.sendRequest("POST", "/payments/refund", {
      paymentId: "pay_pl",
      amount: 100
    });
    expect(expRes.status).toBe(200);
    expect(expRes.data.refundId).toBe("ref_explorer_456");

    // 2. Webhook Simulator
    const webhookRes = await playgroundManager.webhookSimulator.triggerWebhook(
      "https://test.myapi.com/webhook",
      "invoice.paid",
      { invoiceId: "inv_1" },
      "webhook_secret_key"
    );
    expect(webhookRes.delivered).toBe(true);
    expect(webhookRes.signature.length).toBeGreaterThan(0);

    // 3. OAuth Playground
    const url = playgroundManager.oauthPlayground.generateAuthUrl("cli_id", "https://redirect", "write");
    expect(url).toContain("cli_id");
    const token = await playgroundManager.oauthPlayground.exchangeCodeForToken("acos_mock_code_123", "cli_id", "sec");
    expect(token.accessToken).toContain("acos_access_token_");

    // 4. Event Simulator
    let receivedEvent: any = null;
    const unsubscribe = playgroundManager.eventSimulator.subscribe((ev) => {
      receivedEvent = ev;
    });
    playgroundManager.eventSimulator.emitInvoicePaidEvent("inv_100", 500.0);
    expect(receivedEvent).not.toBeNull();
    expect(receivedEvent.type).toBe("invoice.paid");
    expect(receivedEvent.data.amount).toBe(500.0);
    unsubscribe();
  });
});
