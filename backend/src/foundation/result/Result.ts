import { ResultError } from "./ResultError.js";

/**
 * Lightweight generic class representing the outcome of an operation.
 * A Result is either a Success carrying a value of type T, or a Failure carrying a ResultError.
 */
export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  private readonly _value?: T;
  private readonly _error?: ResultError;

  /**
   * Private constructor. Use static factories ok() or fail() to instantiate.
   */
  private constructor(isSuccess: boolean, error?: ResultError, value?: T) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this._error = error;
    this._value = value;
    Object.freeze(this);
  }

  /**
   * Retrieves the successful value.
   * Throws an exception if called on a Failure result.
   */
  public get value(): T {
    if (this.isFailure) {
      throw new Error("Cannot access the value of a failure result. Check isSuccess first.");
    }
    return this._value as T;
  }

  /**
   * Retrieves the failure error.
   * Throws an exception if called on a Success result.
   */
  public get error(): ResultError {
    if (this.isSuccess) {
      throw new Error("Cannot access the error of a success result. Check isFailure first.");
    }
    return this._error as ResultError;
  }

  /**
   * Static factory representing a successful operation.
   * @param value Optional successful value.
   */
  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  /**
   * Static factory representing a failed operation.
   * @param error The standardized ResultError.
   */
  public static fail<U>(error: ResultError): Result<U> {
    if (error === null || error === undefined) {
      throw new Error("Failure result must be provided with an error.");
    }
    return new Result<U>(false, error, undefined);
  }

  /**
   * Helper utility to combine multiple Results.
   * Returns the first failure found, or a success if all passed.
   * Useful for batch processing or aggregate validations.
   */
  public static combine(results: Result<any>[]): Result<void> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.error);
      }
    }
    return Result.ok();
  }
}
