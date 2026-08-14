import { describe, it, expect, beforeEach, vi } from "vitest";
import { MigrationHistory } from "../history/MigrationHistory.js";
import { MigrationRunner } from "../runners/MigrationRunner.js";
import { RollbackRunner } from "../runners/RollbackRunner.js";
import { MigrationValidator } from "../validators/MigrationValidator.js";
import { SeedRunner } from "../seeds/SeedRunner.js";
import { MigrationGenerator } from "../generators/MigrationGenerator.js";
import { InitialSchemaMigration } from "../scripts/001_initial_schema.js";
import { AddIndexesMigration } from "../scripts/002_add_indexes.js";
import { MigrationFactory } from "../factories/MigrationFactory.js";

describe("Migrations Infrastructure Layer Tests (Task 36.8)", () => {
  beforeEach(() => {
    MigrationHistory.clear();
    SeedRunner.clear();
  });

  describe("MigrationHistory Ledger", () => {
    it("should register executions, verify statuses, and clear logs", () => {
      expect(MigrationHistory.isApplied("001_initial_schema")).toBe(false);

      MigrationHistory.record("001_initial_schema", 1);
      expect(MigrationHistory.isApplied("001_initial_schema")).toBe(true);

      const applied = MigrationHistory.getApplied();
      expect(applied.length).toBe(1);
      expect(applied[0].name).toBe("001_initial_schema");

      MigrationHistory.remove("001_initial_schema");
      expect(MigrationHistory.isApplied("001_initial_schema")).toBe(false);
    });
  });

  describe("MigrationValidator Sequence checks", () => {
    it("should pass sequence checks for unique versions", () => {
      const scripts = [new InitialSchemaMigration(), new AddIndexesMigration()];
      expect(() => MigrationValidator.validateSequence(scripts)).not.toThrow();
    });

    it("should fail sequence checks when duplicate versions or names exist", () => {
      const script1 = new InitialSchemaMigration();
      const script2 = {
        name: "001_initial_schema",
        version: 2,
        up: async () => {},
        down: async () => {}
      };

      expect(() => {
        MigrationValidator.validateSequence([script1, script2]);
      }).toThrow("Duplicate migration script name detected");

      const script3 = {
        name: "another_schema",
        version: 1,
        up: async () => {},
        down: async () => {}
      };
      expect(() => {
        MigrationValidator.validateSequence([script1, script3]);
      }).toThrow("Duplicate migration script version detected");
    });
  });

  describe("MigrationRunner & RollbackRunner", () => {
    it("should sequentially run pending scripts up and log history records", async () => {
      const scripts = [new InitialSchemaMigration(), new AddIndexesMigration()];
      const runner = new MigrationRunner(scripts);

      const up1 = vi.spyOn(scripts[0], "up");
      const up2 = vi.spyOn(scripts[1], "up");

      await runner.runPending();

      expect(up1).toHaveBeenCalledTimes(1);
      expect(up2).toHaveBeenCalledTimes(1);
      expect(MigrationHistory.getApplied().length).toBe(2);

      // Verify running again skips already applied scripts
      await runner.runPending();
      expect(up1).toHaveBeenCalledTimes(1); // Still 1
    });

    it("should rollback applied migrations in reverse chronological order", async () => {
      const scripts = [new InitialSchemaMigration(), new AddIndexesMigration()];
      const runner = new MigrationRunner(scripts);
      await runner.runPending();

      const rollback = new RollbackRunner(scripts);
      const down1 = vi.spyOn(scripts[0], "down");
      const down2 = vi.spyOn(scripts[1], "down");

      // Rollback last (should undo version 2 first)
      await rollback.rollbackLast();
      expect(down2).toHaveBeenCalledTimes(1);
      expect(down1).toHaveBeenCalledTimes(0);
      expect(MigrationHistory.getApplied().length).toBe(1);

      // Rollback all remaining
      await rollback.rollbackAll();
      expect(down1).toHaveBeenCalledTimes(1);
      expect(MigrationHistory.getApplied().length).toBe(0);
    });
  });

  describe("SeedRunner Database Seeding", () => {
    it("should run database seeding and register seed category completions", async () => {
      expect(SeedRunner.getAppliedSeeds().length).toBe(0);

      await SeedRunner.seedAll();
      expect(SeedRunner.getAppliedSeeds()).toContain("currencies");
      expect(SeedRunner.getAppliedSeeds()).toContain("roles");
    });
  });

  describe("MigrationGenerator Template", () => {
    it("should compile migration template strings containing target versions and names", () => {
      const template = MigrationGenerator.generateTemplate("add_user_keys", 3);

      expect(template).toContain('public readonly name = "add_user_keys";');
      expect(template).toContain("public readonly version = 3;");
      expect(template).toContain("export class Migration_");
    });
  });

  describe("MigrationFactory", () => {
    it("should construct runners from factories", () => {
      const runner = MigrationFactory.createMigrationRunner();
      expect(runner).toBeInstanceOf(MigrationRunner);

      const rollback = MigrationFactory.createRollbackRunner();
      expect(rollback).toBeInstanceOf(RollbackRunner);
    });
  });
});
