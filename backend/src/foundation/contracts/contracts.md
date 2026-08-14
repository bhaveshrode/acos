# Contracts Submodule Guide — ACOS Foundation Layer

This guide outlines the purpose, architectural categories, and engineering principles for interfaces and abstractions defined in the `foundation/contracts` package of the Autonomous Commerce OS (ACOS).

---

## 1. Architectural Philosophy: Collaboration via Promises

In ACOS, a **Contract** (interface) represents a promise. It answers *what* capability is required, never *how* it is fulfilled. 

### Core Dependency Rule: Dependency Inversion
All modules in ACOS must adhere to the Dependency Inversion Principle:
- **Consumer** (e.g., `PaymentService`) depends on the **Contract** (e.g., `IEmailProvider` or `INotificationService`).
- **Implementation** (e.g., `SendGridEmailProvider` in the Infrastructure Layer) implements the **Contract**.
- Business modules **never** import concrete classes from the Infrastructure Layer.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Consumer    ├──────►│     Contract    │◄──────┤  Implementation │
│ (Domain Module) │       │ (Contracts Lib) │       │ (Infrastructure)│
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## 2. Structural Categories of Contracts

ACOS divides its contracts into six distinct categories:

### 1. System Contracts
Platform-wide low-level services.
- `ILogger`: Structured, contextual logging.
- `IConfigurationProvider`: Type-safe application settings retrieval.
- `ISerializer`: Standardized serialization (JSON, Binary) for event payloads.
- `IIdGenerator`: Generates safe string IDs.

### 2. Provider Contracts
Abstractions for third-party infrastructure.
- `IEmailProvider`: Delivering HTML/text emails.
- `ISmsProvider`: Sending short text messages.
- `IStorageProvider`: Storing and retrieving file streams, generating signed URLs.
- `ICacheProvider`: Key-value TTL caching.
- `ISecretProvider`: Accessing sensitive credentials from environment managers.

### 3. Security Contracts
Security, hashing, and authorization.
- `ITokenProvider`: JWT generation and authorization checks.
- `IPasswordHasher`: Securing account credentials.
- `ISignatureVerifier`: Validating cryptographic transaction signatures.
- `IPermissionEvaluator`: Role/Attribute-based access control.

### 4. Payment Contracts
Financial capabilities (no third-party naming like Stripe/Coinbase).
- `IPaymentGateway`: Creating charges, tracking states, initiating refunds.
- `IWalletProvider`: Ledger balances and address generation.
- `ISettlementProvider`: Orchestrating bank transfers and payouts.
- `IExchangeRateProvider`: Querying currency exchange rates.

### 5. AI Contracts
The autonomous intelligent execution layer.
- `IAgent`: Standard model executor context.
- `ITool` / `IToolRegistry`: Formatting and invoking tools bound to LLMs.
- `IPromptProvider`: Prompt template builders.
- `IMemoryProvider`: Semantic context memory buffers.

### 6. Workflow Contracts
Autonomous flow execution engine.
- `IWorkflowEngine`: Creating, pausing, resuming, and executing workflow instances.
- `IStepExecutor`: Running specific business tasks within a workflow step.
- `IRuleEngine`: Evaluating state-based rules.
- `IConditionEvaluator`: Evaluating specific conditions.

---

## 3. Engineering Rules & Best Practices

1. **Failure Semantics**:
   - Contract methods that have expected failure conditions (e.g., "invalid credentials" in `ITokenProvider`, "file not found" in `IStorageProvider`, "insufficient balance" in `IWalletProvider`) **must return `Result<T>` or `Promise<Result<T>>`**.
   - Contract methods should only throw native `Exception` types when unrecoverable host environment errors occur (e.g. database socket connection drops).
2. **Minimal Surface Area**: Interfaces should contain only the methods absolutely necessary for domain consumers. Avoid bloated interfaces.
3. **No Infrastructure Leakage**: Never reference ORM models, SQL statements, Express-specific request/response objects, or database-specific structures in contract signatures. Always use primitive types, domain entities, or plain DTOs.
4. **Immutability of Inputs**: Arguments passed into contracts must not be modified by the implementing classes (implementing classes must treat inputs as read-only).
