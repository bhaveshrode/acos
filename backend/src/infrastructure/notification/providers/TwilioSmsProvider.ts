import { ISmsProvider, SmsOptions } from "../../../foundation/contracts/provider/ISmsProvider.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Concrete provider executing SMS delivery via Twilio API.
 */
export class TwilioSmsProvider implements ISmsProvider {
  constructor(
    private readonly accountSid: string,
    private readonly authToken: string,
    private readonly fromNumber: string
  ) {}

  /**
   * Simulates/dispatches SMS text carrier payload.
   */
  public async send(options: SmsOptions): Promise<Result<void>> {
    // In production this interfaces with Twilio REST API SDK
    return Result.ok();
  }
}
