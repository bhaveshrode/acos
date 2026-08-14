import { describe, it, expect, vi, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaUnitOfWork } from "../unit-of-work/PrismaUnitOfWork.js";
import { TransactionScope } from "../scopes/TransactionScope.js";
import { TransactionManager } from "../managers/TransactionManager.js";
import { TransactionFactory } from "../factories/TransactionFactory.js";

describe("Transactions Infrastructure Layer Tests (Task 27.8)", () => {
  let mockTxClient: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockTxClient = {
      customer: {
        upsert: vi.fn().mockResolvedValue({})
      }
    };

    mockPrisma = {
      $transaction: vi.fn(async (callback) => {
        return callback(mockTxClient);
      })
    };
  });

  it("should start interactive transaction, bind client context, and commit on resolve", async () => {
    const uow = new PrismaUnitOfWork(mockPrisma as unknown as PrismaClient);

    // Call begin asynchronously to check state
    const beginPromise = uow.begin();

    // Small delay to allow the spin loop inside begin to pick up mockTxClient
    await new Promise((resolve) => setTimeout(resolve, 5));

    // Verify ambient scope got entered
    expect(TransactionScope.current).toBe(mockTxClient);

    // Trigger commit
    await uow.commit();
    await beginPromise;

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("should start interactive transaction and rollback when rollback is requested", async () => {
    const uow = new PrismaUnitOfWork(mockPrisma as unknown as PrismaClient);

    const beginPromise = uow.begin();
    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(TransactionScope.current).toBe(mockTxClient);

    // Trigger rollback
    await uow.rollback();
    await beginPromise;

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("should coordinate manager execution scope and commit on success", async () => {
    const manager = new TransactionManager(mockPrisma as unknown as PrismaClient);

    const result = await manager.execute(async () => {
      expect(TransactionScope.current).toBe(mockTxClient);
      return "succeeded";
    });

    expect(result).toBe("succeeded");
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("should coordinate manager execution scope and rollback on exception", async () => {
    const manager = new TransactionManager(mockPrisma as unknown as PrismaClient);

    await expect(
      manager.execute(async () => {
        expect(TransactionScope.current).toBe(mockTxClient);
        throw new Error("Failed inside block");
      })
    ).rejects.toThrow("Failed inside block");

    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it("should instantiate from TransactionFactory", () => {
    const factory = new TransactionFactory(mockPrisma as unknown as PrismaClient);
    expect(factory.createUnitOfWork()).toBeInstanceOf(PrismaUnitOfWork);
    expect(factory.createManager()).toBeInstanceOf(TransactionManager);
  });
});
