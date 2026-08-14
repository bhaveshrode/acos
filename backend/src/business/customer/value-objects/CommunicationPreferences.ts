import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";

export interface CommunicationPreferencesProps {
  email: boolean;
  sms: boolean;
  portal: boolean;
}

/**
 * Value Object representing notification channel preferences.
 */
export class CommunicationPreferences extends ValueObject<CommunicationPreferencesProps> {
  private constructor(props: CommunicationPreferencesProps) {
    super(props);
  }

  /**
   * Creates a CommunicationPreferences.
   */
  public static create(
    email: boolean = true,
    sms: boolean = false,
    portal: boolean = false
  ): Result<CommunicationPreferences> {
    return Result.ok(new CommunicationPreferences({ email, sms, portal }));
  }

  public get email(): boolean { return this.props.email; }
  public get sms(): boolean { return this.props.sms; }
  public get portal(): boolean { return this.props.portal; }
}
