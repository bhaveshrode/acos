import { ICommunicationProvider } from "./ICommunicationProvider.js";

/**
 * TwilioAdapter adapting Twilio SMS API.
 */
export class TwilioAdapter implements ICommunicationProvider {
  public async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    return false;
  }

  public async sendSms(to: string, message: string): Promise<boolean> {
    return to.length > 0 && message.length > 0;
  }
}
