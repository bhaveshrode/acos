import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { SettlementAmount } from "../value-objects/SettlementAmount.js";
import { TreasuryReference } from "../value-objects/TreasuryReference.js";

export interface TreasuryReceiptProps {
  wallet: string;
  receivedAmount: SettlementAmount;
  timestamp: Date;
  treasuryReference: TreasuryReference;
}

/**
 * Child Entity representing an internal treasury acknowledgement of received funds.
 */
export class TreasuryReceipt extends Entity<UniqueEntityID> {
  private props: TreasuryReceiptProps;

  constructor(id: UniqueEntityID, props: TreasuryReceiptProps) {
    super(id);
    this.props = props;
  }

  public get wallet(): string { return this.props.wallet; }
  public get receivedAmount(): SettlementAmount { return this.props.receivedAmount; }
  public get timestamp(): Date { return this.props.timestamp; }
  public get treasuryReference(): TreasuryReference { return this.props.treasuryReference; }
}
