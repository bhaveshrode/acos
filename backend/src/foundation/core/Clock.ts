/**
 * Contract representing the Clock abstraction in ACOS.
 */
export interface IClock {
  /**
   * Returns the current date and time as a Date object.
   */
  now(): Date;
}

/**
 * System Clock implementation used in production.
 * Obtains time directly from the host system.
 */
export class SystemClock implements IClock {
  /**
   * Returns the current machine time.
   */
  public now(): Date {
    return new Date();
  }
}

/**
 * Controllable Clock implementation used for tests.
 * Allows freezing, shifting, and manually setting the time.
 */
export class TestClock implements IClock {
  private _now: Date;

  /**
   * Creates a TestClock initialized to a specific instant, or the current host time.
   * @param initialDate Optional starting date.
   */
  constructor(initialDate?: Date) {
    this._now = initialDate ? new Date(initialDate) : new Date();
  }

  /**
   * Returns a copy of the currently set test time.
   */
  public now(): Date {
    return new Date(this._now);
  }

  /**
   * Manually sets the test time to a specific Date.
   * @param date The new date.
   */
  public setTime(date: Date): void {
    if (date === null || date === undefined) {
      throw new Error("Date cannot be null or undefined.");
    }
    this._now = new Date(date);
  }

  /**
   * Advances the test time by a set number of milliseconds.
   * @param ms Milliseconds to advance.
   */
  public advance(ms: number): void {
    this._now = new Date(this._now.getTime() + ms);
  }

  /**
   * Advances the test time by a set number of seconds.
   * @param seconds Seconds to advance.
   */
  public advanceSeconds(seconds: number): void {
    this.advance(seconds * 1000);
  }

  /**
   * Advances the test time by a set number of minutes.
   * @param minutes Minutes to advance.
   */
  public advanceMinutes(minutes: number): void {
    this.advance(minutes * 60 * 1000);
  }

  /**
   * Advances the test time by a set number of hours.
   * @param hours Hours to advance.
   */
  public advanceHours(hours: number): void {
    this.advance(hours * 60 * 60 * 1000);
  }

  /**
   * Advances the test time by a set number of days.
   * @param days Days to advance.
   */
  public advanceDays(days: number): void {
    this.advance(days * 24 * 60 * 60 * 1000);
  }
}

/**
 * Static registry wrapper class for obtaining the current time.
 * Defaults to the production SystemClock, but can be swapped out
 * (e.g., in unit tests) to use a TestClock.
 */
export class Clock {
  private static _provider: IClock = new SystemClock();

  /**
   * Swaps the active time provider.
   * @param provider The clock provider implementation.
   */
  public static setProvider(provider: IClock): void {
    if (provider === null || provider === undefined) {
      throw new Error("Clock provider cannot be null or undefined.");
    }
    this._provider = provider;
  }

  /**
   * Resets the active provider back to the default production SystemClock.
   */
  public static reset(): void {
    this._provider = new SystemClock();
  }

  /**
   * Gets the current date/time from the active provider.
   */
  public static now(): Date {
    return this._provider.now();
  }
}
