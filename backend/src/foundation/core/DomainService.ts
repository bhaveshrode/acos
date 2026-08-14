/**
 * Base abstract class representing a Domain Service.
 * Domain Services are stateless operations that encapsulate business logic
 * that does not naturally belong to a single Entity or Value Object.
 *
 * Domain Services must remain strictly stateless and have no infrastructure dependencies.
 */
export abstract class DomainService {
  /**
   * Protected constructor to prevent direct instantiation of the marker class.
   */
  protected constructor() {}
}
