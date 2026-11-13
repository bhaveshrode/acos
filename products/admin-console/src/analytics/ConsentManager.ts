/**
 * ConsentManager tracking opt-in preferences.
 */
export class ConsentManager {
  private consentGranted: boolean = false;

  public grantConsent(): void {
    this.consentGranted = true;
  }

  public revokeConsent(): void {
    this.consentGranted = false;
  }

  public isConsentGranted(): boolean {
    return this.consentGranted;
  }
}
