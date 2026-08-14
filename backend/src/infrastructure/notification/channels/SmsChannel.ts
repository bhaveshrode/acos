import { ISmsProvider } from "../../../foundation/contracts/provider/ISmsProvider.js";
import { TemplateRenderer } from "../renderers/TemplateRenderer.js";
import { Result } from "../../../foundation/result/Result.js";

export interface SmsNotification {
  to: string;
  template: string;
  variables: Record<string, any>;
}

/**
 * High-level channel wrapping template formatting and executing sending via an SMS provider.
 */
export class SmsChannel {
  constructor(private readonly provider: ISmsProvider) {}

  /**
   * Compiles template variables and forwards the SMS message.
   */
  public async send(notification: SmsNotification): Promise<Result<void>> {
    const message = TemplateRenderer.render(notification.template, notification.variables);
    return this.provider.send({
      to: notification.to,
      message
    });
  }
}
