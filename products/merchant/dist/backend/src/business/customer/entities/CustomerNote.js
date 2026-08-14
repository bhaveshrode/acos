import { Entity } from "../../../foundation/core/Entity.js";
/**
 * Child Entity representing internal-only notes written about a customer.
 */
export class CustomerNote extends Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    get content() { return this.props.content; }
    get createdBy() { return this.props.createdBy; }
    get createdAt() { return this.props.createdAt; }
    /**
     * Updates note text content.
     */
    updateContent(content) {
        this.props.content = content;
    }
}
