import { describe, it, expect, vi } from "vitest";
import { Guard } from "./Guard.js";
import { ObjectUtils } from "./ObjectUtils.js";
import { CollectionUtils } from "./CollectionUtils.js";
import { StringUtils } from "./StringUtils.js";
import { AsyncUtils } from "./AsyncUtils.js";
import { Disposable, IDisposable } from "./Disposable.js";

describe("Utilities Submodule Unit Tests (Task 9.2)", () => {
  describe("Guard assertions", () => {
    it("should assert notNull correctly", () => {
      expect(() => Guard.notNull(5)).not.toThrow();
      expect(() => Guard.notNull(null)).toThrow("Value cannot be null.");
      expect(() => Guard.notNull(null, "Fail")).toThrow("Fail");
    });

    it("should assert notUndefined correctly", () => {
      expect(() => Guard.notUndefined(null)).not.toThrow();
      expect(() => Guard.notUndefined(undefined)).toThrow("Value cannot be undefined.");
    });

    it("should assert notEmpty correctly", () => {
      expect(() => Guard.notEmpty("abc")).not.toThrow();
      expect(() => Guard.notEmpty("")).toThrow("String cannot be null or empty.");
      expect(() => Guard.notEmpty("  ")).toThrow("String cannot be null or empty.");
    });

    it("should assert isArray and isObject correctly", () => {
      expect(() => Guard.isArray([1])).not.toThrow();
      expect(() => Guard.isArray("not-array")).toThrow();
      expect(() => Guard.isObject({ a: 1 })).not.toThrow();
      expect(() => Guard.isObject([])).toThrow();
      expect(() => Guard.isObject(null)).toThrow();
    });
  });

  describe("ObjectUtils", () => {
    it("should deepFreeze objects recursively", () => {
      const obj = { user: { profile: { name: "alice" } } };
      ObjectUtils.deepFreeze(obj);
      expect(Object.isFrozen(obj)).toBe(true);
      expect(Object.isFrozen(obj.user.profile)).toBe(true);
      expect(() => { obj.user.profile.name = "bob"; }).toThrow();
    });

    it("should deepClone objects safely including Dates", () => {
      const original = { date: new Date(), items: [{ id: 1 }] };
      const cloned = ObjectUtils.deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned.date).toBeInstanceOf(Date);
      expect(cloned.date).not.toBe(original.date);
      expect(cloned.items[0]).not.toBe(original.items[0]);
    });

    it("should deepMerge nested structures", () => {
      const target = { a: 1, config: { port: 80, debug: false } };
      const source = { b: 2, config: { debug: true, host: "localhost" } };
      
      const merged = ObjectUtils.deepMerge(target, source);
      expect(merged).toEqual({
        a: 1,
        b: 2,
        config: {
          port: 80,
          debug: true,
          host: "localhost"
        }
      });
    });

    it("should pick and omit keys correctly", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(ObjectUtils.pick(obj, ["a", "c"])).toEqual({ a: 1, c: 3 });
      expect(ObjectUtils.omit(obj, ["b"])).toEqual({ a: 1, c: 3 });
    });
  });

  describe("CollectionUtils", () => {
    it("should remove duplicates using distinct", () => {
      expect(CollectionUtils.distinct([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
    });

    it("should groupBy key selectors", () => {
      const list = [{ role: "admin", name: "A" }, { role: "user", name: "B" }, { role: "admin", name: "C" }];
      const grouped = CollectionUtils.groupBy(list, (item) => item.role);
      
      expect(grouped.admin).toHaveLength(2);
      expect(grouped.user).toHaveLength(1);
    });

    it("should partition collection values based on predicates", () => {
      const list = [1, 2, 3, 4, 5];
      const [evens, odds] = CollectionUtils.partition(list, (x) => x % 2 === 0);
      expect(evens).toEqual([2, 4]);
      expect(odds).toEqual([1, 3, 5]);
    });

    it("should chunk collections into sizes", () => {
      const list = [1, 2, 3, 4, 5];
      const chunks = CollectionUtils.chunk(list, 2);
      expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
    });
  });

  describe("StringUtils", () => {
    it("should capitalize correctly", () => {
      expect(StringUtils.capitalize("hello")).toBe("Hello");
      expect(StringUtils.capitalize("")).toBe("");
    });

    it("should convert to camelCase, kebabCase, and snakeCase", () => {
      const input = "User_profile-name  value";
      expect(StringUtils.camelCase(input)).toBe("userProfileNameValue");
      expect(StringUtils.kebabCase("userProfileNameValue")).toBe("user-profile-name-value");
      expect(StringUtils.snakeCase("userProfileNameValue")).toBe("user_profile_name_value");
    });

    it("should truncate strings adding ellipsis", () => {
      expect(StringUtils.truncate("Hello World", 5)).toBe("Hello...");
      expect(StringUtils.truncate("Hello", 10)).toBe("Hello");
    });

    it("should normalize whitespaces", () => {
      expect(StringUtils.normalizeWhitespace("  hello   world \n new  line  ")).toBe("hello world new line");
    });
  });

  describe("AsyncUtils", () => {
    it("should delay execution", async () => {
      const start = Date.now();
      await AsyncUtils.delay(15);
      const diff = Date.now() - start;
      expect(diff).toBeGreaterThanOrEqual(14);
    });

    it("should retry operations and resolve on success", async () => {
      let attempts = 0;
      const op = async () => {
        attempts++;
        if (attempts < 3) throw new Error("Fail");
        return "Success";
      };

      const result = await AsyncUtils.retry(op, 3, 5);
      expect(result).toBe("Success");
      expect(attempts).toBe(3);
    });

    it("should fail after maximum retry attempts are exhausted", async () => {
      const op = async () => {
        throw new Error("Always fail");
      };

      await expect(
        AsyncUtils.retry(op, 2, 5)
      ).rejects.toThrow("Always fail");
    });
  });

  describe("Disposable pattern helpers", () => {
    it("should safely dispose resources", async () => {
      const mockDispose = vi.fn();
      const resource: IDisposable = { dispose: mockDispose };

      await Disposable.safeDispose(resource);
      expect(mockDispose).toHaveBeenCalledTimes(1);

      // Safe dispose on null/undefined should not crash
      await expect(Disposable.safeDispose(null)).resolves.toBeUndefined();
    });

    it("should dispose all resources in list", async () => {
      const d1 = { dispose: vi.fn() };
      const d2 = { dispose: vi.fn() };

      await Disposable.disposeAll([d1, d2]);
      expect(d1.dispose).toHaveBeenCalledTimes(1);
      expect(d2.dispose).toHaveBeenCalledTimes(1);
    });
  });
});
