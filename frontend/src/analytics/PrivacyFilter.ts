/**
 * PrivacyFilter removing sensitive email templates or passwords.
 */
export class PrivacyFilter {
  public filterSensitiveData(payload: Record<string, any>): Record<string, any> {
    const sanitized = { ...payload };
    for (const key of Object.keys(sanitized)) {
      if (key.toLowerCase().includes("email")) {
        sanitized[key] = "[MASKED_EMAIL]";
      }
      if (key.toLowerCase().includes("password") || key.toLowerCase().includes("secret")) {
        sanitized[key] = "[REDACTED]";
      }
    }
    return sanitized;
  }
}
