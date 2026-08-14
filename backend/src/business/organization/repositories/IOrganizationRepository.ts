import { Organization } from "../aggregates/Organization.js";
import { OrganizationId } from "../value-objects/OrganizationId.js";
import { OrganizationSlug } from "../value-objects/OrganizationSlug.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Domain Repository contract managing the Organization aggregate root persistence lifecycle.
 */
export interface IOrganizationRepository {
  /**
   * Retrieves an Organization by its unique ID.
   */
  findById(id: OrganizationId): Promise<Result<Organization>>;

  /**
   * Retrieves an Organization by its unique slug identifier.
   */
  findBySlug(slug: OrganizationSlug): Promise<Result<Organization>>;

  /**
   * Saves or updates an Organization aggregate in database.
   */
  save(org: Organization): Promise<Result<void>>;

  /**
   * Checks if an Organization already exists with the specified slug.
   */
  exists(slug: OrganizationSlug): Promise<Result<boolean>>;

  /**
   * Permanently deletes an Organization aggregate by ID.
   */
  delete(id: OrganizationId): Promise<Result<void>>;
}
