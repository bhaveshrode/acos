import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { ConfirmationSource } from "../enums/ConfirmationSource.js";
import { ConfirmationCount } from "../value-objects/ConfirmationCount.js";

export interface SettlementConfirmationProps {
  source: ConfirmationSource;
  count: ConfirmationCount;
  timestamp: Date;
}

/**
 * Child Entity representing a block, bank, gateway, or treasury confirmation signal.
 */
export class SettlementConfirmation extends Entity<UniqueEntityID> {
  private props: SettlementConfirmationProps;

  constructor(id: UniqueEntityID, props: SettlementConfirmationProps) {
    super(id);
    this.props = props;
  }

  public get source(): ConfirmationSource { return this.props.source; }
  public get count(): ConfirmationCount { return this.props.count; }
  public get timestamp(): Date { return this.props.timestamp; }
}
