/**
 * PrivacyPolicy containing GDPR rules.
 */
export class PrivacyPolicy {
  constructor(
    public readonly gdprCompliant: boolean = true,
    public readonly allowRetentionOverride: boolean = false
  ) {
    Object.freeze(this);
  }
}
