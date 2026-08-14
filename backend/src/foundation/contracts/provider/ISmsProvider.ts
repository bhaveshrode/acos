import { Result } from "../../result/Result.js";

export interface SmsOptions {
  to: string;
  message: string;
}

/**
 * Interface representing external SMS dispatch capability (e.g. Twilio, AWS SNS).
 */
export interface ISmsProvider {
  /**
   * Dispatches a text message.
   * @param options Recipient number and message text content.
   */
  send(options: SmsOptions): Promise<Result<void>>;
}
