/**
 * Base notification exception.
 */
export class NotificationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationException";
  }
}

/**
 * Thrown when a SMS or SMTP connection cannot be established.
 */
export class ProviderUnavailableException extends NotificationException {
  constructor(provider: string, details: string) {
    super(`Notification provider '${provider}' is unavailable: ${details}`);
    this.name = "ProviderUnavailableException";
  }
}

/**
 * Thrown when string parsing or variable replacement fails.
 */
export class TemplateRenderException extends NotificationException {
  constructor(templateName: string, details: string) {
    super(`Failed to render template '${templateName}': ${details}`);
    this.name = "TemplateRenderException";
  }
}

/**
 * Thrown when carrier delivery operations fail.
 */
export class DeliveryFailedException extends NotificationException {
  constructor(to: string, details: string) {
    super(`Failed to deliver notification to '${to}': ${details}`);
    this.name = "DeliveryFailedException";
  }
}
