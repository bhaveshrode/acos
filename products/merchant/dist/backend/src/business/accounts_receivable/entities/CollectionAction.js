import { Entity } from "../../../foundation/core/Entity.js";
/**
 * Child Entity representing an action taken to collect outstanding debts.
 */
export class CollectionAction extends Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    get actionType() { return this.props.actionType; }
    get notes() { return this.props.notes; }
    get performedBy() { return this.props.performedBy; }
    get timestamp() { return this.props.timestamp; }
}
