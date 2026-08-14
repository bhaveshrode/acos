/**
 * Base abstract Specification class representing a business predicate.
 * Can be logically composed using AND, OR, and NOT operations.
 */
export abstract class Specification<T> {
  /**
   * Checks if the candidate object satisfies the specification.
   * @param candidate The object to check.
   */
  public abstract isSatisfiedBy(candidate: T): boolean;

  /**
   * Combines this specification with another using a logical AND.
   * @param other The other specification.
   */
  public and(other: Specification<T>): Specification<T> {
    return new AndSpecification<T>(this, other);
  }

  /**
   * Combines this specification with another using a logical OR.
   * @param other The other specification.
   */
  public or(other: Specification<T>): Specification<T> {
    return new OrSpecification<T>(this, other);
  }

  /**
   * Negates this specification using a logical NOT.
   */
  public not(): Specification<T> {
    return new NotSpecification<T>(this);
  }
}

/**
 * Composite specification representing a logical AND of two specifications.
 */
export class AndSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {
    super();
    if (!left || !right) {
      throw new Error("Both left and right specifications must be provided.");
    }
  }

  public isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

/**
 * Composite specification representing a logical OR of two specifications.
 */
export class OrSpecification<T> extends Specification<T> {
  constructor(
    private readonly left: Specification<T>,
    private readonly right: Specification<T>
  ) {
    super();
    if (!left || !right) {
      throw new Error("Both left and right specifications must be provided.");
    }
  }

  public isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

/**
 * Composite specification representing a logical NOT of a specification.
 */
export class NotSpecification<T> extends Specification<T> {
  constructor(private readonly spec: Specification<T>) {
    super();
    if (!spec) {
      throw new Error("Specification must be provided.");
    }
  }

  public isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}
