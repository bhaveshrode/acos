import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { EmailAddress } from "../value-objects/EmailAddress.js";
import { PhoneNumber } from "../value-objects/PhoneNumber.js";

export interface ContactProps {
  name: string;
  email: EmailAddress;
  phone?: PhoneNumber;
  department?: string;
  designation?: string;
  isPrimary: boolean;
}

/**
 * Child Entity representing a contact person affiliated with a Customer.
 */
export class Contact extends Entity<UniqueEntityID> {
  private props: ContactProps;

  constructor(id: UniqueEntityID, props: ContactProps) {
    super(id);
    this.props = props;
  }

  public get name(): string { return this.props.name; }
  public get email(): EmailAddress { return this.props.email; }
  public get phone(): PhoneNumber | undefined { return this.props.phone; }
  public get department(): string | undefined { return this.props.department; }
  public get designation(): string | undefined { return this.props.designation; }
  public get isPrimary(): boolean { return this.props.isPrimary; }

  /**
   * Sets the primary flag status of the contact.
   */
  public setPrimary(isPrimary: boolean): void {
    this.props.isPrimary = isPrimary;
  }

  /**
   * Updates core contact details.
   */
  public updateDetails(
    name: string,
    email: EmailAddress,
    phone?: PhoneNumber,
    department?: string,
    designation?: string
  ): void {
    this.props.name = name;
    this.props.email = email;
    this.props.phone = phone;
    this.props.department = department;
    this.props.designation = designation;
  }
}
