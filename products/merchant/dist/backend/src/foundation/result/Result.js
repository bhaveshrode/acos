/**
 * Lightweight generic class representing the outcome of an operation.
 * A Result is either a Success carrying a value of type T, or a Failure carrying a ResultError.
 */
export class Result {
    isSuccess;
    isFailure;
    _value;
    _error;
    /**
     * Private constructor. Use static factories ok() or fail() to instantiate.
     */
    constructor(isSuccess, error, value) {
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
    get value() {
        if (this.isFailure) {
            throw new Error("Cannot access the value of a failure result. Check isSuccess first.");
        }
        return this._value;
    }
    /**
     * Retrieves the failure error.
     * Throws an exception if called on a Success result.
     */
    get error() {
        if (this.isSuccess) {
            throw new Error("Cannot access the error of a success result. Check isFailure first.");
        }
        return this._error;
    }
    /**
     * Static factory representing a successful operation.
     * @param value Optional successful value.
     */
    static ok(value) {
        return new Result(true, undefined, value);
    }
    /**
     * Static factory representing a failed operation.
     * @param error The standardized ResultError.
     */
    static fail(error) {
        if (error === null || error === undefined) {
            throw new Error("Failure result must be provided with an error.");
        }
        return new Result(false, error, undefined);
    }
    /**
     * Helper utility to combine multiple Results.
     * Returns the first failure found, or a success if all passed.
     * Useful for batch processing or aggregate validations.
     */
    static combine(results) {
        for (const result of results) {
            if (result.isFailure) {
                return Result.fail(result.error);
            }
        }
        return Result.ok();
    }
}
