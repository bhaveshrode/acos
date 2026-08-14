import { IConfigurationProvider } from "../../../foundation/contracts/system/IConfigurationProvider.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

/**
 * Base configuration provider supplying type-safe numeric and boolean parses.
 */
export abstract class BaseConfigurationProvider implements IConfigurationProvider {
  /**
   * Retrieves the raw string value of a key.
   */
  protected abstract getRaw(key: string): string | undefined;

  public get(key: string): Result<string> {
    const val = this.getRaw(key);
    if (val === undefined || val === null) {
      return Result.fail(ResultError.notFound(`Configuration key '${key}' not found.`));
    }
    return Result.ok(val);
  }

  public getNumber(key: string): Result<number> {
    const val = this.getRaw(key);
    if (val === undefined || val === null || val.trim() === "") {
      return Result.fail(ResultError.notFound(`Configuration key '${key}' not found.`));
    }
    const num = Number(val);
    if (isNaN(num)) {
      return Result.fail(ResultError.validation(`Configuration key '${key}' contains invalid number format.`));
    }
    return Result.ok(num);
  }

  public getBoolean(key: string): Result<boolean> {
    const val = this.getRaw(key);
    if (val === undefined || val === null || val.trim() === "") {
      return Result.fail(ResultError.notFound(`Configuration key '${key}' not found.`));
    }
    const normalized = val.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return Result.ok(true);
    }
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return Result.ok(false);
    }
    return Result.fail(ResultError.validation(`Configuration key '${key}' contains invalid boolean format.`));
  }
}
