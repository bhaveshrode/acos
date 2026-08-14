import { UniqueEntityID } from "../../../foundation/core/Identifier.js";

/**
 * Value Object representing a unique Workflow identifier.
 */
export class WorkflowId extends UniqueEntityID {
  constructor(value?: string) {
    super(value);
  }

  /**
   * Generates a new WorkflowId.
   */
  public static override generate(): WorkflowId {
    return new WorkflowId();
  }

  /**
   * Creates a WorkflowId from a string UUID representation.
   */
  public static override from(value: string): WorkflowId {
    return new WorkflowId(value);
  }
}
