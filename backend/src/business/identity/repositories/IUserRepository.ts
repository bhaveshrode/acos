import { User } from "../aggregates/User.js";
import { UserId } from "../value-objects/UserId.js";
import { Email } from "../value-objects/Email.js";
import { Result } from "../../../foundation/result/Result.js";

/**
 * Domain Repository interface for managing User aggregate root persistence lifecycle.
 */
export interface IUserRepository {
  /**
   * Retrieves a User aggregate by its unique identity.
   */
  findById(id: UserId): Promise<Result<User>>;

  /**
   * Retrieves a User aggregate by their unique email address.
   */
  findByEmail(email: Email): Promise<Result<User>>;

  /**
   * Saves or updates a User aggregate in persistence.
   */
  save(user: User): Promise<Result<void>>;

  /**
   * Checks if a User aggregate exists with the specified email address.
   */
  exists(email: Email): Promise<Result<boolean>>;

  /**
   * Permanently deletes a User aggregate by ID.
   */
  delete(id: UserId): Promise<Result<void>>;
}
