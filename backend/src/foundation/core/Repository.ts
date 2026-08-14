import { AggregateRoot } from "./AggregateRoot.js";
import { Identifier } from "./Identifier.js";
import { Specification } from "./Specification.js";

/**
 * Interface representing read-only persistence operations on an Aggregate Root.
 */
export interface IReadRepository<
  TAggregate extends AggregateRoot<TId>,
  TId extends Identifier<any>
> {
  /**
   * Retrieves an aggregate by its unique identifier.
   * Returns null if no aggregate is found.
   * @param id The aggregate identifier.
   */
  findById(id: TId): Promise<TAggregate | null>;

  /**
   * Checks if an aggregate with the given identifier exists.
   * @param id The aggregate identifier.
   */
  exists(id: TId): Promise<boolean>;

  /**
   * Retrieves all aggregates of this type.
   */
  findAll(): Promise<readonly TAggregate[]>;

  /**
   * Retrieves all aggregates matching a given business specification.
   * @param specification The specification predicate.
   */
  findBySpecification(
    specification: Specification<TAggregate>
  ): Promise<readonly TAggregate[]>;
}

/**
 * Interface representing write-only persistence operations on an Aggregate Root.
 */
export interface IWriteRepository<
  TAggregate extends AggregateRoot<TId>,
  TId extends Identifier<any>
> {
  /**
   * Saves or updates an aggregate in persistence.
   * @param aggregate The aggregate root instance.
   */
  save(aggregate: TAggregate): Promise<void>;

  /**
   * Deletes an aggregate from persistence by its identifier.
   * @param id The aggregate identifier.
   */
  delete(id: TId): Promise<void>;
}

/**
 * Composed Repository interface representing read and write operations.
 * This is the standard repository contract that aggregates will define.
 */
export interface IRepository<
  TAggregate extends AggregateRoot<TId>,
  TId extends Identifier<any>
> extends IReadRepository<TAggregate, TId>, IWriteRepository<TAggregate, TId> {}
