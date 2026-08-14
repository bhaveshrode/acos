/**
 * HealthCheck carrying individual check metrics.
 */
export class HealthCheck {
    name;
    isHealthy;
    errorDetails;
    constructor(name, isHealthy, errorDetails) {
        this.name = name;
        this.isHealthy = isHealthy;
        this.errorDetails = errorDetails;
        Object.freeze(this);
    }
}
