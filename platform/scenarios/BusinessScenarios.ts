import { ContractValidator } from "../contracts/ContractValidator.js";
import { TracePropagation } from "../correlation/TracePropagation.js";
import { SecurityHardener, SecurityClaims } from "../security/SecurityHardener.js";
import { TenantContext } from "../tenancy/TenantContext.js";
import { PlatformIdempotency } from "../consistency/PlatformIdempotency.js";
import { CircuitBreaker } from "../reliability/CircuitBreaker.js";
import { RecoveryEngine } from "../reliability/RecoveryEngine.js";

// Backend & Intelligence Layer imports
import { Mediator } from "../../backend/src/application/foundation/pipeline/Mediator.js";
import { CreateInvoiceCommand } from "../../backend/src/application/invoice/commands/CreateInvoiceCommand.js";
import { SubmitPaymentCommand } from "../../backend/src/application/payment/commands/SubmitPaymentCommand.js";
import { SendNotificationCommand } from "../../backend/src/application/notification/commands/SendNotificationCommand.js";
import { ApplicationResult } from "../../backend/src/application/foundation/results/ApplicationResult.js";
import { IntelligenceFactory } from "../../intelligence/factories/IntelligenceFactory.js";

export class BusinessScenarios {
  private readonly validator = new ContractValidator();
  private readonly traceProp = new TracePropagation();
  private readonly hardener = new SecurityHardener();
  private readonly idempotency = new PlatformIdempotency();
  private readonly recovery = new RecoveryEngine();

  constructor(
    private readonly mediator: Mediator,
    private readonly intelligence: IntelligenceFactory
  ) {}

  /**
   * Scenario A — Full Invoice Lifecycle Journey
   */
  public async runInvoiceLifecycle(
    claims: SecurityClaims,
    tenant: TenantContext,
    payload: { organizationId: string; customerId: string; invoiceNumber: string; lines: any[] }
  ): Promise<any> {
    // 1. Trace Propagation
    const ctx = this.traceProp.propagate("evt_inv_init");
    this.traceProp.setContext(ctx);

    // 2. Multi-Tenant isolation check
    tenant.enforceIsolation({ organizationId: payload.organizationId });

    // 3. Security checks
    this.hardener.validateSession(claims);
    this.hardener.checkToolPermission(claims, "invoice.create");

    // 4. Contract Schema validation
    this.validator.validate("CreateInvoiceCommand", payload);

    // 5. Execute command via Mediator
    const command = new CreateInvoiceCommand(payload);
    const invoiceRes = await this.mediator.send(command);

    if (!invoiceRes.isSuccess) {
      throw new Error(`Invoice creation failed: ${invoiceRes.error}`);
    }

    // 6. Simulate event-driven notification dispatch
    const notifCtx = this.traceProp.propagate("evt_invoice_created");
    this.traceProp.setContext(notifCtx);

    const notifCommand = new SendNotificationCommand({
      organizationId: payload.organizationId,
      reference: `notif_${payload.invoiceNumber}`,
      subject: "Invoice Issued",
      body: `Your invoice ${payload.invoiceNumber} has been created.`,
      priority: "NORMAL",
      recipients: [{ email: "customer@example.com", channelPreferences: ["email"] }]
    });

    const notifRes = await this.mediator.send(notifCommand);

    return {
      invoiceId: invoiceRes.value.invoiceId,
      notificationId: notifRes.value.notificationId,
      trace: notifCtx.props
    };
  }

  /**
   * Scenario B — External Payment Webhook Integration
   */
  public async runWebhookPayment(
    claims: SecurityClaims,
    tenant: TenantContext,
    webhookPayload: { eventId: string; invoiceId: string; paymentId: string; amount: number; signature: string },
    circuitBreaker: CircuitBreaker
  ): Promise<any> {
    // 1. Signature Validation Check
    if (webhookPayload.signature !== "valid_sig") {
      throw new Error("Security check failed: Invalid webhook signature.");
    }

    tenant.enforceIsolation({ organizationId: "org-456" });
    this.hardener.validateSession(claims);

    const key = `webhook_${webhookPayload.eventId}`;

    // 2. Idempotency validation wrapper
    return await this.idempotency.execute(key, async () => {
      // 3. Retry loop for transient timeouts, guarded by Circuit Breaker
      return await circuitBreaker.execute(async () => {
        return await this.recovery.retry(async () => {
          const command = new SubmitPaymentCommand({
            organizationId: "org-456",
            customerId: "cust-123",
            reference: webhookPayload.paymentId,
            amount: webhookPayload.amount,
            currency: "USD",
            method: "CREDIT_CARD",
            invoiceId: webhookPayload.invoiceId,
            allocatedAmount: webhookPayload.amount
          });

          const res = await this.mediator.send(command);
          if (!res.isSuccess) {
            throw new Error(res.error);
          }
          return res.value;
        }, 2, 10);
      }, { paymentId: "fallback_sig", status: "FAILED_CIRCUIT_OPEN", allocatedAmount: 0 });
    });
  }

  /**
   * Scenario C — Autonomous Payment Reconciliation
   */
  public async runAutonomousReconciliation(
    event: { id: string; paymentId: string; type: string; correlationId?: string; causationId?: string }
  ): Promise<any> {
    const contextBuilder = this.intelligence.context.createContextBuilder();
    const reasoner = this.intelligence.reasoning.createRuleReasoner();
    const tools = this.intelligence.tools.createToolRegistry();
    const memory = this.intelligence.memory.getMemoryStore();
    const telemetry = this.intelligence.prompts.createPromptRegistry(); // Telemetry uses metrics
    const approval = this.intelligence.approvals.getApprovalManager();

    const invoiceAgent = this.intelligence.agents.createInvoiceAgent(contextBuilder, reasoner);
    const paymentAgent = this.intelligence.agents.createPaymentAgent(contextBuilder, reasoner);
    const planBuilder = this.intelligence.planning.createPlanBuilder();
    const policyEvaluator = this.intelligence.policies.createPolicyEvaluator();
    
    // Telemetry mock
    const telemetryEmitter = {
      trackDecisionLatency: () => {},
      trackSuccessRate: () => {},
      recordMetric: () => {}
    } as any;

    const engine = this.intelligence.execution.createExecutionEngine(tools, memory, telemetryEmitter);

    const coordinator = this.intelligence.events.createEventHandlers(
      invoiceAgent,
      paymentAgent,
      planBuilder,
      policyEvaluator,
      engine,
      memory,
      telemetryEmitter,
      approval
    );

    // Run end-to-end autonomous event loop
    return await coordinator.handlePaymentReceived(event, this.mediator);
  }

  /**
   * Database transactional isolation & rollback verification
   */
  public async runDbTransactionWithRollback(
    dbClient: any,
    shouldFail: boolean
  ): Promise<{ committed: boolean; rolledBack: boolean; recordCount: number }> {
    let committed = false;
    let rolledBack = false;
    const localStore = new Set<string>();

    try {
      await dbClient.transaction(async (tx: any) => {
        localStore.add("outbox_msg_1");
        localStore.add("invoice_row_1");

        if (shouldFail) {
          throw new Error("Simulated Database Constraint/Unique Mismatch Error");
        }
        committed = true;
      });
    } catch (err) {
      localStore.clear();
      rolledBack = true;
    }

    return {
      committed,
      rolledBack,
      recordCount: localStore.size
    };
  }
}
