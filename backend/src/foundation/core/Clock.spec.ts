import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Clock, SystemClock, TestClock } from "./Clock.js";

describe("Clock Abstraction (IU-006)", () => {
  beforeEach(() => {
    // Reset provider before each test to prevent test leakage
    Clock.reset();
  });

  afterEach(() => {
    Clock.reset();
  });

  describe("SystemClock", () => {
    it("should return the current machine time", () => {
      const clock = new SystemClock();
      const before = Date.now();
      const now = clock.now().getTime();
      const after = Date.now();

      expect(now).toBeGreaterThanOrEqual(before);
      expect(now).toBeLessThanOrEqual(after);
    });
  });

  describe("TestClock", () => {
    it("should initialize to custom date when provided", () => {
      const fixed = new Date("2026-07-23T00:00:00Z");
      const clock = new TestClock(fixed);
      expect(clock.now().toISOString()).toBe(fixed.toISOString());
    });

    it("should initialize to current host time when no argument is provided", () => {
      const before = Date.now();
      const clock = new TestClock();
      const now = clock.now().getTime();
      const after = Date.now();

      expect(now).toBeGreaterThanOrEqual(before);
      expect(now).toBeLessThanOrEqual(after);
    });

    it("should allow setting the time manually", () => {
      const clock = new TestClock(new Date("2026-07-23T00:00:00Z"));
      const target = new Date("2026-08-23T12:00:00Z");
      
      clock.setTime(target);
      expect(clock.now().toISOString()).toBe(target.toISOString());
    });

    it("should throw if setting to null or undefined time", () => {
      const clock = new TestClock();
      expect(() => clock.setTime(null as any)).toThrow("Date cannot be null or undefined.");
      expect(() => clock.setTime(undefined as any)).toThrow("Date cannot be null or undefined.");
    });

    it("should advance time correctly with advance() (ms)", () => {
      const clock = new TestClock(new Date("2026-07-23T00:00:00.000Z"));
      clock.advance(500);
      expect(clock.now().toISOString()).toBe("2026-07-23T00:00:00.500Z");
    });

    it("should advance time correctly with advanceSeconds()", () => {
      const clock = new TestClock(new Date("2026-07-23T00:00:00Z"));
      clock.advanceSeconds(30);
      expect(clock.now().toISOString()).toBe("2026-07-23T00:00:30.000Z");
    });

    it("should advance time correctly with advanceMinutes()", () => {
      const clock = new TestClock(new Date("2026-07-23T00:00:00Z"));
      clock.advanceMinutes(45);
      expect(clock.now().toISOString()).toBe("2026-07-23T00:45:00.000Z");
    });

    it("should advance time correctly with advanceHours()", () => {
      const clock = new TestClock(new Date("2026-07-23T00:00:00Z"));
      clock.advanceHours(4);
      expect(clock.now().toISOString()).toBe("2026-07-23T04:00:00.000Z");
    });

    it("should advance time correctly with advanceDays()", () => {
      const clock = new TestClock(new Date("2026-07-23T00:00:00Z"));
      clock.advanceDays(7);
      expect(clock.now().toISOString()).toBe("2026-07-30T00:00:00.000Z");
    });
  });

  describe("Clock (Static Registry)", () => {
    it("should default to the SystemClock provider", () => {
      const before = Date.now();
      const now = Clock.now().getTime();
      const after = Date.now();

      expect(now).toBeGreaterThanOrEqual(before);
      expect(now).toBeLessThanOrEqual(after);
    });

    it("should delegate to set test provider correctly", () => {
      const testClock = new TestClock(new Date("2026-01-01T00:00:00Z"));
      Clock.setProvider(testClock);
      
      expect(Clock.now().toISOString()).toBe("2026-01-01T00:00:00.000Z");
      
      testClock.advanceDays(2);
      expect(Clock.now().toISOString()).toBe("2026-01-03T00:00:00.000Z");
    });

    it("should throw an error on registering null or undefined provider", () => {
      expect(() => Clock.setProvider(null as any)).toThrow("Clock provider cannot be null or undefined.");
      expect(() => Clock.setProvider(undefined as any)).toThrow("Clock provider cannot be null or undefined.");
    });

    it("should reset back to system clock", () => {
      const testClock = new TestClock(new Date("2026-01-01T00:00:00Z"));
      Clock.setProvider(testClock);
      expect(Clock.now().toISOString()).toBe("2026-01-01T00:00:00.000Z");

      Clock.reset();
      
      // Should now be back to machine time
      expect(Clock.now().getFullYear()).toBeGreaterThanOrEqual(2026);
    });
  });
});
