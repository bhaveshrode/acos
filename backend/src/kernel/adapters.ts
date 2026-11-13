/**
 * Adapter surface: persistence extractors/hydrators/serializers, messaging and
 * security helpers that the domain does not own.
 *
 * This entry point exists so consumers can wire adapters without deep imports.
 * It is expected to shrink: persistence belongs to the consumer, not to a
 * kernel, and Phase 4 moves these out.
 */

export { MessagingFactory } from "../adapters/messaging/factories/MessagingFactory.js";

export { CustomerExtractor } from "../adapters/persistence/extractors/CustomerExtractor.js";
export { InvoiceExtractor } from "../adapters/persistence/extractors/InvoiceExtractor.js";

export { CustomerHydrator } from "../adapters/persistence/hydrators/CustomerHydrator.js";
export { InvoiceHydrator } from "../adapters/persistence/hydrators/InvoiceHydrator.js";
export { OrganizationHydrator } from "../adapters/persistence/hydrators/OrganizationHydrator.js";
export { PaymentHydrator } from "../adapters/persistence/hydrators/PaymentHydrator.js";

export { OrganizationSerializer } from "../adapters/persistence/serializers/OrganizationSerializer.js";
export { PaymentSerializer } from "../adapters/persistence/serializers/PaymentSerializer.js";
export { UserSerializer } from "../adapters/persistence/serializers/UserSerializer.js";

export { JwtTokenProvider } from "../adapters/security/JwtTokenProvider.js";
export { PasswordHasher } from "../adapters/security/PasswordHasher.js";
