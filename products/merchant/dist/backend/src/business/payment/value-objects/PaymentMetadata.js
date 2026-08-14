import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
/**
 * Value Object wrapping dictionary parameters representing gateway payload metadata.
 */
export class PaymentMetadata extends ValueObject {
    constructor(props) {
        super(props);
    }
    /**
     * Creates a PaymentMetadata.
     */
    static create(metadata = {}) {
        return Result.ok(new PaymentMetadata({ metadata }));
    }
    get value() {
        return this.props.metadata;
    }
}
