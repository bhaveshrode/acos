import { OnboardingStep } from "./OnboardingStep.js";

/**
 * OnboardingManager tracking setup progress.
 */
export class OnboardingManager {
  private readonly completedSteps = new Set<OnboardingStep>();

  public completeStep(step: OnboardingStep): void {
    this.completedSteps.add(step);
  }

  public isStepCompleted(step: OnboardingStep): boolean {
    return this.completedSteps.has(step);
  }

  public isOnboardingFinished(): boolean {
    // Requires all preliminary steps before mark complete
    return (
      this.isStepCompleted(OnboardingStep.UserRegistered) &&
      this.isStepCompleted(OnboardingStep.OrganizationCreated) &&
      this.isStepCompleted(OnboardingStep.MerchantProfileSetup) &&
      this.isStepCompleted(OnboardingStep.PaymentProviderConnected)
    );
  }

  public clear(): void {
    this.completedSteps.clear();
  }
}
