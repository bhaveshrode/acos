import { SmtpEmailProvider } from "../providers/SmtpEmailProvider.js";
import { TwilioSmsProvider } from "../providers/TwilioSmsProvider.js";
import { EmailChannel } from "../channels/EmailChannel.js";
import { SmsChannel } from "../channels/SmsChannel.js";
import { ConfigurationSnapshot } from "../../../foundation/config/ConfigurationSnapshot.js";

/**
 * Factory class generating concrete notification engines and delivery channels.
 */
export class NotificationFactory {
  /**
   * Builds an SmtpEmailProvider using configurations.
   */
  public static createEmailProvider(config?: ConfigurationSnapshot): SmtpEmailProvider {
    const host = config?.event?.provider === "smtp" ? "smtp.acos.io" : "localhost";
    return new SmtpEmailProvider(host, 587, false);
  }

  /**
   * Builds a TwilioSmsProvider using configurations.
   */
  public static createSmsProvider(config?: ConfigurationSnapshot): TwilioSmsProvider {
    return new TwilioSmsProvider("mock-sid", "mock-token", "+15005550006");
  }

  /**
   * Assembles an EmailChannel with SMTP providers.
   */
  public static createEmailChannel(config?: ConfigurationSnapshot): EmailChannel {
    return new EmailChannel(this.createEmailProvider(config));
  }

  /**
   * Assembles an SmsChannel with SMS providers.
   */
  public static createSmsChannel(config?: ConfigurationSnapshot): SmsChannel {
    return new SmsChannel(this.createSmsProvider(config));
  }
}
