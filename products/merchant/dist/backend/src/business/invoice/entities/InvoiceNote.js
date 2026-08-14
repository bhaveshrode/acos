import { Entity } from "../../../foundation/core/Entity.js";
/**
 * Child Entity representing an internal note or audit record logged against an Invoice.
 */
export class InvoiceNote extends Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    get content() { return this.props.content; }
    get createdBy() { return this.props.createdBy; }
    get createdAt() { return this.props.createdAt; }
    /**
     * Updates note content.
     */
    updateContent(content) {
        this.props.content = content;
    }
}
