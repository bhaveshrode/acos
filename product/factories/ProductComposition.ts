import { FeatureFlagManager } from "../configuration/FeatureFlagManager.js";
import { OnboardingManager } from "../onboarding/OnboardingManager.js";
import { UsageMeter } from "../billing/UsageMeter.js";
import { SubscriptionManager } from "../billing/SubscriptionManager.js";
import { ProviderConnectionManager } from "../providers/ProviderConnectionManager.js";
import { ProductSecurityReview } from "../security/ProductSecurityReview.js";
import { ProductCertifier } from "../certification/ProductCertifier.js";

/**
 * ProductComposition coordinating SaaS onboarding, billing, and setup.
 */
export class ProductComposition {
  public readonly featureFlags = new FeatureFlagManager();
  public readonly onboarding = new OnboardingManager();

  public readonly usageMeter = new UsageMeter();
  public readonly subscriptions = new SubscriptionManager(this.usageMeter);

  public readonly providers = new ProviderConnectionManager();
  public readonly security = new ProductSecurityReview();
  public readonly certifier = new ProductCertifier();

  constructor() {
    Object.freeze(this);
  }
}
