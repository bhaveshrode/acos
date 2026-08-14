import { ValueObject } from "../../../foundation/core/ValueObject.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

export interface WorkspaceNameProps {
  value: string;
}

/**
 * Value Object representing a workspace's display name.
 */
export class WorkspaceName extends ValueObject<WorkspaceNameProps> {
  private constructor(props: WorkspaceNameProps) {
    super(props);
  }

  /**
   * Creates a WorkspaceName.
   */
  public static create(value: string): Result<WorkspaceName> {
    if (!value || value.trim() === "") {
      return Result.fail(ResultError.validation("Workspace name cannot be empty."));
    }
    const trimmed = value.trim();
    if (trimmed.length > 50) {
      return Result.fail(ResultError.validation("Workspace name cannot exceed 50 characters."));
    }
    return Result.ok(new WorkspaceName({ value: trimmed }));
  }

  public get value(): string {
    return this.props.value;
  }
}
