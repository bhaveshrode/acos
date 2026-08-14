/**
 * Base abstract Specification class representing a business predicate.
 * Can be logically composed using AND, OR, and NOT operations.
 */
export class Specification {
    /**
     * Combines this specification with another using a logical AND.
     * @param other The other specification.
     */
    and(other) {
        return new AndSpecification(this, other);
    }
    /**
     * Combines this specification with another using a logical OR.
     * @param other The other specification.
     */
    or(other) {
        return new OrSpecification(this, other);
    }
    /**
     * Negates this specification using a logical NOT.
     */
    not() {
        return new NotSpecification(this);
    }
}
/**
 * Composite specification representing a logical AND of two specifications.
 */
export class AndSpecification extends Specification {
    left;
    right;
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
        if (!left || !right) {
            throw new Error("Both left and right specifications must be provided.");
        }
    }
    isSatisfiedBy(candidate) {
        return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
    }
}
/**
 * Composite specification representing a logical OR of two specifications.
 */
export class OrSpecification extends Specification {
    left;
    right;
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
        if (!left || !right) {
            throw new Error("Both left and right specifications must be provided.");
        }
    }
    isSatisfiedBy(candidate) {
        return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
    }
}
/**
 * Composite specification representing a logical NOT of a specification.
 */
export class NotSpecification extends Specification {
    spec;
    constructor(spec) {
        super();
        this.spec = spec;
        if (!spec) {
            throw new Error("Specification must be provided.");
        }
    }
    isSatisfiedBy(candidate) {
        return !this.spec.isSatisfiedBy(candidate);
    }
}
