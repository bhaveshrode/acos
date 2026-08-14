import { IRequestValidator } from "../../foundation/validation/IRequestValidator.js";
import { CreateOrganizationCommand } from "../commands/CreateOrganizationCommand.js";

/**
 * Request validator checking fields structures and slugs formats for creating an Organization.
 */
export class CreateOrganizationCommandValidator
  implements IRequestValidator<CreateOrganizationCommand>
{
  public validate(request: CreateOrganizationCommand): string[] {
    const errors: string[] = [];
    const { dto } = request;

    if (!dto) {
      errors.push("Request payload must be provided.");
      return errors;
    }

    if (!dto.name || dto.name.trim() === "") {
      errors.push("Organization name is required.");
    }

    if (!dto.slug || dto.slug.trim() === "") {
      errors.push("Organization slug is required.");
    } else {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(dto.slug)) {
        errors.push(
          `Invalid slug format: '${dto.slug}'. Slugs must contain only lowercase letters, numbers, and hyphens.`
        );
      }
    }

    if (!dto.ownerId || dto.ownerId.trim() === "") {
      errors.push("Owner user ID is required.");
    }

    return errors;
  }
}
