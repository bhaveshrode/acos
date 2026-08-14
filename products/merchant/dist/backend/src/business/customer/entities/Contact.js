import { Entity } from "../../../foundation/core/Entity.js";
/**
 * Child Entity representing a contact person affiliated with a Customer.
 */
export class Contact extends Entity {
    props;
    constructor(id, props) {
        super(id);
        this.props = props;
    }
    get name() { return this.props.name; }
    get email() { return this.props.email; }
    get phone() { return this.props.phone; }
    get department() { return this.props.department; }
    get designation() { return this.props.designation; }
    get isPrimary() { return this.props.isPrimary; }
    /**
     * Sets the primary flag status of the contact.
     */
    setPrimary(isPrimary) {
        this.props.isPrimary = isPrimary;
    }
    /**
     * Updates core contact details.
     */
    updateDetails(name, email, phone, department, designation) {
        this.props.name = name;
        this.props.email = email;
        this.props.phone = phone;
        this.props.department = department;
        this.props.designation = designation;
    }
}
