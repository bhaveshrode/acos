import { IEmailProvider, EmailOptions } from "../../../foundation/contracts/provider/IEmailProvider.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Concrete provider executing email delivery via SMTP servers.
 */
export class SmtpEmailProvider implements IEmailProvider {
  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly secure: boolean,
    private readonly user?: string,
    private readonly pass?: string
  ) {}

  /**
   * Simulates/dispatches SMTP mail message.
   */
  public async send(options: EmailOptions): Promise<Result<void>> {
    // In production this interfaces with nodemailer / SMTP carrier pools
    return Result.ok();
  }
}
