import { Entity } from "../../../foundation/core/Entity.js";
/**
 * Child Entity representing a processing attempt with gateway telemetry response.
 */
export class PaymentAttempt extends Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    get timestamp() { return this.props.timestamp; }
    get status() { return this.props.status; }
    get gatewayResponse() { return this.props.gatewayResponse; }
    get errorCode() { return this.props.errorCode; }
}
