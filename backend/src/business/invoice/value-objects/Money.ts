import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface MoneyProps {
  amountMinor: number;
  currency: string;
}

/**
 * ISO 4217 exponents that differ from the default of 2.
 * @see https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml
 */
const CURRENCY_EXPONENTS: Readonly<Record<string, number>> = Object.freeze({
  BIF: 0, CLP: 0, DJF: 0, GNF: 0, ISK: 0, JPY: 0, KMF: 0, KRW: 0,
  PYG: 0, RWF: 0, UGX: 0, VND: 0, VUV: 0, XAF: 0, XOF: 0, XPF: 0,
  BHD: 3, IQD: 3, JOD: 3, KWD: 3, LYD: 3, OMR: 3, TND: 3,
  CLF: 4, UYW: 4
});

const DEFAULT_EXPONENT = 2;

/**
 * Returns the number of decimal places used by a currency.
 */
export function currencyExponent(currency: string): number {
  return CURRENCY_EXPONENTS[currency] ?? DEFAULT_EXPONENT;
}

/**
 * Rounds half away from zero, which is what money arithmetic is expected to do.
 * Math.round alone rounds -0.5 towards zero and is therefore asymmetric.
 */
function roundHalfAwayFromZero(value: number): number {
  return value < 0 ? -Math.round(-value) : Math.round(value);
}

/**
 * Value Object representing a currency amount.
 * Values are stored as integer minor units so that arithmetic is exact; the
 * major-unit amount is derived on read.
 */
export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  /**
   * Creates a Money value object from a major-unit amount.
   */
  public static create(amount: number, currency: string): Result<Money> {
    const normalized = Money.normalizeCurrency(currency);
    if (normalized.isFailure) {
      return Result.fail(normalized.error);
    }
    if (!Number.isFinite(amount)) {
      return Result.fail(ResultError.validation("Amount must be a finite number."));
    }

    const cleanCurrency = normalized.value;
    const minorUnits = roundHalfAwayFromZero(amount * 10 ** currencyExponent(cleanCurrency));
    return Money.fromMinorUnits(minorUnits, cleanCurrency);
  }

  /**
   * Creates a Money value object from an integer minor-unit amount.
   */
  public static fromMinorUnits(minorUnits: number, currency: string): Result<Money> {
    const normalized = Money.normalizeCurrency(currency);
    if (normalized.isFailure) {
      return Result.fail(normalized.error);
    }
    if (!Number.isSafeInteger(minorUnits)) {
      return Result.fail(
        ResultError.validation(
          `Amount out of range: ${minorUnits} ${normalized.value} minor units is not a safe integer.`
        )
      );
    }
    return Result.ok(new Money({ amountMinor: minorUnits, currency: normalized.value }));
  }

  /**
   * Creates a zero Money amount for the given currency.
   */
  public static zero(currency: string): Money {
    const normalized = Money.normalizeCurrency(currency);
    const clean = normalized.isSuccess ? normalized.value : currency.trim().toUpperCase();
    return new Money({ amountMinor: 0, currency: clean });
  }

  private static normalizeCurrency(currency: string): Result<string> {
    const clean = typeof currency === "string" ? currency.trim().toUpperCase() : "";
    if (!/^[A-Z]{3,6}$/.test(clean)) {
      return Result.fail(ResultError.validation(`Invalid currency code: '${currency}'.`));
    }
    return Result.ok(clean);
  }

  /**
   * The amount in major units, derived from the stored minor units.
   */
  public get amount(): number {
    return this.props.amountMinor / 10 ** this.exponent;
  }

  /**
   * The amount in integer minor units.
   */
  public get minorUnits(): number {
    return this.props.amountMinor;
  }

  public get currency(): string {
    return this.props.currency;
  }

  public get exponent(): number {
    return currencyExponent(this.currency);
  }

  /**
   * Adds two Money amounts, verifying currencies match.
   */
  public add(other: Money): Result<Money> {
    if (this.currency !== other.currency) {
      return Result.fail(
        ResultError.conflict(
          `Currency mismatch: Cannot add ${other.currency} to ${this.currency}.`
        )
      );
    }
    return Money.fromMinorUnits(this.minorUnits + other.minorUnits, this.currency);
  }

  /**
   * Subtracts two Money amounts, verifying currencies match.
   */
  public subtract(other: Money): Result<Money> {
    if (this.currency !== other.currency) {
      return Result.fail(
        ResultError.conflict(
          `Currency mismatch: Cannot subtract ${other.currency} from ${this.currency}.`
        )
      );
    }
    return Money.fromMinorUnits(this.minorUnits - other.minorUnits, this.currency);
  }

  /**
   * Multiplies money by a numeric scalar, rounding half away from zero.
   */
  public multiply(multiplier: number): Result<Money> {
    if (!Number.isFinite(multiplier)) {
      return Result.fail(ResultError.validation("Multiplier must be a finite number."));
    }
    const scaled = this.minorUnits * multiplier;
    if (!Number.isFinite(scaled)) {
      return Result.fail(ResultError.validation("Product is out of range."));
    }
    return Money.fromMinorUnits(roundHalfAwayFromZero(scaled), this.currency);
  }
}
