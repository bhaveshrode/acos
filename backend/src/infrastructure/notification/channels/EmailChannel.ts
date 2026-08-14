import { IEmailProvider } from "../../../foundation/contracts/provider/IEmailProvider.js";
import { TemplateRenderer } from "../renderers/TemplateRenderer.js";
import { Result } from "../../../foundation/result/Result.js";

export interface EmailNotification {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, any>;
  from?: string;
}

/**
 * High-level channel wrapping template formatting and executing sending via an email provider.
 */
export class EmailChannel {
  constructor(private readonly provider: IEmailProvider) {}

  /**
   * Compiles HTML template variables and forwards the email message.
   */
  public async send(notification: EmailNotification): Promise<Result<void>> {
    const html = TemplateRenderer.render(notification.template, notification.variables);
    return this.provider.send({
      to: notification.to,
      subject: notification.subject,
      html,
      from: notification.from
    });
  }
}
