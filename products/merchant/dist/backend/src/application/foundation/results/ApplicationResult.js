/**
 * Envelope representing standard CQRS response outcomes.
 */
export class ApplicationResult {
    isSuccess;
    value;
    errors;
    constructor(isSuccess, value, errors) {
        this.isSuccess = isSuccess;
        this.value = value;
        this.errors = errors;
    }
    /**
     * Generates a successful ApplicationResult wrapper.
     */
    static success(value) {
        return new ApplicationResult(true, value, []);
    }
    /**
     * Generates a failed ApplicationResult wrapper.
     */
    static failure(errors) {
        const errorList = Array.isArray(errors) ? errors : [errors];
        return new ApplicationResult(false, null, errorList);
    }
}
