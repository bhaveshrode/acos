import { Entity } from "../../../foundation/core/Entity.js";
/**
 * Child Entity representing a User's membership details inside an Organization.
 * Uses UserId as its unique entity identity.
 */
export class Member extends Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    get userId() {
        return this.id;
    }
    get role() { return this.props.role; }
    get joinedAt() { return this.props.joinedAt; }
    get status() { return this.props.status; }
    /**
     * Updates the member's administrative role.
     */
    updateRole(role) {
        this.props.role = role;
    }
    /**
     * Updates the membership status.
     */
    updateStatus(status) {
        this.props.status = status;
    }
}
