/**
 * Adapter surface: persistence extractors/hydrators/serializers, messaging and
 * authentication helpers that the domain does not own.
 *
 * This entry point exists so consumers can wire infrastructure without deep
 * imports. It is expected to shrink: persistence belongs to the consumer, not
 * to a kernel, and Phase 4 moves these out.
 */

export { MessagingFactory } from "../infrastructure/messaging/factories/MessagingFactory.js";

export { CustomerExtractor } from "../infrastructure/persistence/extractors/CustomerExtractor.js";
export { InvoiceExtractor } from "../infrastructure/persistence/extractors/InvoiceExtractor.js";

export { CustomerHydrator } from "../infrastructure/persistence/hydrators/CustomerHydrator.js";
export { InvoiceHydrator } from "../infrastructure/persistence/hydrators/InvoiceHydrator.js";
export { OrganizationHydrator } from "../infrastructure/persistence/hydrators/OrganizationHydrator.js";
export { PaymentHydrator } from "../infrastructure/persistence/hydrators/PaymentHydrator.js";

export { OrganizationSerializer } from "../infrastructure/persistence/serializers/OrganizationSerializer.js";
export { PaymentSerializer } from "../infrastructure/persistence/serializers/PaymentSerializer.js";
export { UserSerializer } from "../infrastructure/persistence/serializers/UserSerializer.js";

export { JwtTokenProvider } from "../presentation/authentication/JwtTokenProvider.js";
export { PasswordHasher } from "../presentation/authentication/PasswordHasher.js";
