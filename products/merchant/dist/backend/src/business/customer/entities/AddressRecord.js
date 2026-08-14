import { Entity } from "../../../foundation/core/Entity.js";
/**
 * Child Entity associating a physical Address Value Object with an AddressType.
 */
export class AddressRecord extends Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    get address() { return this.props.address; }
    get type() { return this.props.type; }
    /**
     * Updates address attributes.
     */
    updateAddress(address) {
        this.props.address = address;
    }
    /**
     * Swaps the address classification.
     */
    updateType(type) {
        this.props.type = type;
    }
}
