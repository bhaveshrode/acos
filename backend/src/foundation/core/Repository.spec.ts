import { describe, it, expect } from "vitest";
import { AggregateRoot } from "./AggregateRoot.js";
import { UniqueEntityID } from "./Identifier.js";
import { Specification } from "./Specification.js";
import { IRepository } from "./Repository.js";

// Mock aggregate and identifier subclasses
class MockInvoiceId extends UniqueEntityID {
  constructor(value?: string) {
    super(value);
  }
}

class MockInvoice extends AggregateRoot<MockInvoiceId> {
  public amount: number;
  public status: "DRAFT" | "ISSUED" | "PAID";

  constructor(id: MockInvoiceId, amount: number, status: "DRAFT" | "ISSUED" | "PAID") {
    super(id);
    this.amount = amount;
    this.status = status;
  }
}

// Custom Specification for test filtering
class InvoiceAmountGreaterThan extends Specification<MockInvoice> {
  constructor(private readonly limit: number) {
    super();
  }

  public isSatisfiedBy(candidate: MockInvoice): boolean {
    return candidate.amount > this.limit;
  }
}

// In-Memory Repository Implementation satisfying the IRepository contract
class InMemoryMockInvoiceRepository implements IRepository<MockInvoice, MockInvoiceId> {
  private readonly db = new Map<string, MockInvoice>();

  public async findById(id: MockInvoiceId): Promise<MockInvoice | null> {
    const record = this.db.get(id.value);
    return record ? record : null;
  }

  public async exists(id: MockInvoiceId): Promise<boolean> {
    return this.db.has(id.value);
  }

  public async findAll(): Promise<readonly MockInvoice[]> {
    return Array.from(this.db.values());
  }

  public async findBySpecification(
    specification: Specification<MockInvoice>
  ): Promise<readonly MockInvoice[]> {
    const list = Array.from(this.db.values());
    return list.filter((item) => specification.isSatisfiedBy(item));
  }

  public async save(aggregate: MockInvoice): Promise<void> {
    this.db.set(aggregate.id.value, aggregate);
  }

  public async delete(id: MockInvoiceId): Promise<void> {
    this.db.delete(id.value);
  }
}

describe("Repository Abstraction (IU-008)", () => {
  it("should compile and support mock in-memory operations correctly", async () => {
    const repo = new InMemoryMockInvoiceRepository();
    const id = new MockInvoiceId();
    const invoice = new MockInvoice(id, 250, "DRAFT");

    // Save and check exists
    await repo.save(invoice);
    const exists = await repo.exists(id);
    expect(exists).toBe(true);

    // Retrieve
    const found = await repo.findById(id);
    expect(found).not.toBeNull();
    expect(found!.id.equals(id)).toBe(true);
    expect(found!.amount).toBe(250);

    // Delete
    await repo.delete(id);
    const existsAfterDelete = await repo.exists(id);
    expect(existsAfterDelete).toBe(false);

    const foundAfterDelete = await repo.findById(id);
    expect(foundAfterDelete).toBeNull();
  });

  it("should correctly query aggregates using Specification composition", async () => {
    const repo = new InMemoryMockInvoiceRepository();
    
    const inv1 = new MockInvoice(new MockInvoiceId(), 500, "DRAFT");
    const inv2 = new MockInvoice(new MockInvoiceId(), 1500, "ISSUED");
    const inv3 = new MockInvoice(new MockInvoiceId(), 2000, "PAID");

    await repo.save(inv1);
    await repo.save(inv2);
    await repo.save(inv3);

    // Spec: amount > 1000
    const overOneThousandSpec = new InvoiceAmountGreaterThan(1000);
    const results = await repo.findBySpecification(overOneThousandSpec);

    expect(results).toHaveLength(2);
    const amounts = results.map(r => r.amount);
    expect(amounts).toContain(1500);
    expect(amounts).toContain(2000);
    expect(amounts).not.toContain(500);
  });
});
