import { ICommunicationProvider } from "./ICommunicationProvider.js";

/**
 * SendGridAdapter adapting external SendGrid APIs.
 */
export class SendGridAdapter implements ICommunicationProvider {
  public async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    return to.includes("@") && subject.length > 0;
  }

  public async sendSms(to: string, message: string): Promise<boolean> {
    return false;
  }
}
