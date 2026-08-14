import { Result } from "../../result/Result.js";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Interface representing external email dispatch capability (e.g. SMTP, SendGrid).
 */
export interface IEmailProvider {
  /**
   * Dispatches an email message.
   * @param options The email recipients, headers, and content.
   */
  send(options: EmailOptions): Promise<Result<void>>;
}
