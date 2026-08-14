import { Entity } from "../../../foundation/core/Entity.js";
import { UniqueEntityID } from "../../../foundation/core/Identifier.js";
import { UserId } from "../../identity/value-objects/UserId.js";

export interface SettlementNoteProps {
  text: string;
  authorId: UserId;
  createdAt: Date;
}

/**
 * Child Entity representing an internal audit or administrative note.
 */
export class SettlementNote extends Entity<UniqueEntityID> {
  private props: SettlementNoteProps;

  constructor(id: UniqueEntityID, props: SettlementNoteProps) {
    super(id);
    this.props = props;
  }

  public get text(): string { return this.props.text; }
  public get authorId(): UserId { return this.props.authorId; }
  public get createdAt(): Date { return this.props.createdAt; }
}
