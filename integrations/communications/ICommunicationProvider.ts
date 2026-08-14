/**
 * ICommunicationProvider declaring email and SMS sending hooks.
 */
export interface ICommunicationProvider {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
  sendSms(to: string, message: string): Promise<boolean>;
}
