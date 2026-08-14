import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { Address } from "../value-objects/Address.js";
import { AddressType } from "../enums/AddressType.js";

export interface AddressRecordProps {
  address: Address;
  type: AddressType;
}

/**
 * Child Entity associating a physical Address Value Object with an AddressType.
 */
export class AddressRecord extends Entity<UniqueEntityID> {
  private props: AddressRecordProps;

  constructor(id: UniqueEntityID, props: AddressRecordProps) {
    super(id);
    this.props = props;
  }

  public get address(): Address { return this.props.address; }
  public get type(): AddressType { return this.props.type; }

  /**
   * Updates address attributes.
   */
  public updateAddress(address: Address): void {
    this.props.address = address;
  }

  /**
   * Swaps the address classification.
   */
  public updateType(type: AddressType): void {
    this.props.type = type;
  }
}
