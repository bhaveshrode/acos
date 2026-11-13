/**
 * ACOS kernel entry point. Consumers import from this module only; the
 * `./*` subpath export exists solely for legacy deep imports and will be removed.
 */

// Foundation
export * from "./foundation/result/Result.js";
export * from "./foundation/result/ResultError.js";

export * from "./foundation/core/AggregateRoot.js";
export * from "./foundation/core/Clock.js";
export * from "./foundation/core/DomainService.js";
export * from "./foundation/core/Entity.js";
export * from "./foundation/core/Identifier.js";
export * from "./foundation/core/Repository.js";
export * from "./foundation/core/Specification.js";
export * from "./foundation/core/ValueObject.js";

export * from "./foundation/events/DomainEvent.js";
export * from "./foundation/events/EventBus.js";
export * from "./foundation/events/EventDispatcher.js";
export * from "./foundation/events/EventHandler.js";
export * from "./foundation/events/EventMetadata.js";
export * from "./foundation/events/IOutboxRepository.js";

export * from "./foundation/exceptions/BaseException.js";
export * from "./foundation/exceptions/DomainException.js";
export * from "./foundation/exceptions/ValidationException.js";

export * from "./foundation/validation/ValidationFailure.js";
export * from "./foundation/validation/ValidationRule.js";
export * from "./foundation/validation/Validator.js";

// Bounded contexts
export * as accountsReceivable from "./business/accounts_receivable/index.js";
export * as customer from "./business/customer/index.js";
export * as identity from "./business/identity/index.js";
export * as invoice from "./business/invoice/index.js";
export * as notification from "./business/notification/index.js";
export * as organization from "./business/organization/index.js";
export * as payment from "./business/payment/index.js";
export * as settlement from "./business/settlement/index.js";
export * as workflow from "./business/workflow/index.js";
