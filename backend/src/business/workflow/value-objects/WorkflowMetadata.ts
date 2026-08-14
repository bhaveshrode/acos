import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";

export interface WorkflowMetadataProps {
  metadata: Record<string, string>;
}

/**
 * Value Object holding additional context or workflow execution telemetry parameters.
 */
export class WorkflowMetadata extends ValueObject<WorkflowMetadataProps> {
  private constructor(props: WorkflowMetadataProps) {
    super(props);
  }

  /**
   * Creates a WorkflowMetadata.
   */
  public static create(metadata: Record<string, string> = {}): Result<WorkflowMetadata> {
    return Result.ok(new WorkflowMetadata({ metadata }));
  }

  public get value(): Record<string, string> {
    return this.props.metadata;
  }
}
