import { Entity } from "../../../foundation/core/Entity.js";
import { InvitationStatus } from "../enums/InvitationStatus.js";
/**
 * Child Entity representing an issued invitation to join the organization.
 */
export class Invitation extends Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    get inviteeEmail() { return this.props.inviteeEmail; }
    get token() { return this.props.token; }
    get expiresAt() { return this.props.expiresAt; }
    get status() { return this.props.status; }
    /**
     * Checks if the invitation's expiration timestamp has passed.
     */
    get isExpired() {
        return Date.now() >= this.expiresAt.getTime();
    }
    /**
     * Transitions invitation to ACCEPTED.
     */
    accept() {
        this.props.status = InvitationStatus.ACCEPTED;
    }
    /**
     * Transitions invitation to EXPIRED.
     */
    expire() {
        this.props.status = InvitationStatus.EXPIRED;
    }
    /**
     * Transitions invitation to REVOKED.
     */
    revoke() {
        this.props.status = InvitationStatus.REVOKED;
    }
}
