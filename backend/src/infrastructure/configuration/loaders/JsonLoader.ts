import fs from "fs";

/**
 * Loads configuration properties from a JSON file.
 * Flattens nested JSON structures into dot-separated paths for unified provider access.
 */
export class JsonLoader {
  /**
   * Reads, parses, and flattens a JSON file.
   * Returns an empty dictionary if the file is missing or unparseable.
   */
  public static load(filePath: string): Record<string, string> {
    if (!fs.existsSync(filePath)) {
      return {};
    }
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      return this.flatten(parsed);
    } catch {
      return {};
    }
  }

  /**
   * Recursively flattens a nested object structure.
   */
  private static flatten(obj: any, prefix = ""): Record<string, string> {
    const result: Record<string, string> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
          Object.assign(result, this.flatten(value, newKey));
        } else {
          result[newKey] = String(value);
        }
      }
    }
    return result;
  }
}
