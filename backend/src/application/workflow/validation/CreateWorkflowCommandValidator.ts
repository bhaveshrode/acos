import { IRequestValidator } from "../../foundation/validation/IRequestValidator.js";
import { CreateWorkflowCommand } from "../commands/CreateWorkflowCommand.js";

/**
 * Request validator checking fields structures and bounds for creating a Workflow.
 */
export class CreateWorkflowCommandValidator
  implements IRequestValidator<CreateWorkflowCommand>
{
  public validate(request: CreateWorkflowCommand): string[] {
    const errors: string[] = [];
    const { dto } = request;

    if (!dto) {
      errors.push("Request payload must be provided.");
      return errors;
    }

    if (!dto.organizationId || dto.organizationId.trim() === "") {
      errors.push("Organization ID is required.");
    }

    if (!dto.reference || dto.reference.trim() === "") {
      errors.push("Workflow reference is required.");
    } else if (!dto.reference.trim().toUpperCase().startsWith("WRK-")) {
      errors.push(
        `Invalid reference format: '${dto.reference}'. References must start with 'WRK-'.`
      );
    }

    if (!dto.name || dto.name.trim() === "") {
      errors.push("Workflow name is required.");
    }

    if (!dto.priority || dto.priority.trim() === "") {
      errors.push("Workflow priority is required.");
    }

    if (!dto.deadline || dto.deadline.trim() === "") {
      errors.push("Workflow deadline is required.");
    }

    if (!dto.tasks || dto.tasks.length === 0) {
      errors.push("At least one workflow task step must be defined.");
    } else {
      dto.tasks.forEach((t, index) => {
        if (!t.title || t.title.trim() === "") {
          errors.push(`Task ${index + 1}: Title is required.`);
        }
      });
    }

    return errors;
  }
}
