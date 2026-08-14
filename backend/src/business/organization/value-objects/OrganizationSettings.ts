import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { Currency } from "./Currency.js";
import { TimeZone } from "./TimeZone.js";

export interface OrganizationSettingsProps {
  defaultCurrency: Currency;
  timeZone: TimeZone;
  invoiceNumberFormat: string;
}

/**
 * Value Object representing Organization-level preferences and defaults.
 */
export class OrganizationSettings extends ValueObject<OrganizationSettingsProps> {
  private constructor(props: OrganizationSettingsProps) {
    super(props);
  }

  /**
   * Creates an OrganizationSettings object.
   */
  public static create(
    defaultCurrency: Currency,
    timeZone: TimeZone,
    invoiceNumberFormat: string = "INV-YYYYMMDD-XXXX"
  ): Result<OrganizationSettings> {
    return Result.ok(
      new OrganizationSettings({
        defaultCurrency,
        timeZone,
        invoiceNumberFormat
      })
    );
  }

  public get defaultCurrency(): Currency { return this.props.defaultCurrency; }
  public get timeZone(): TimeZone { return this.props.timeZone; }
  public get invoiceNumberFormat(): string { return this.props.invoiceNumberFormat; }
}
