/**
 * Utility containing helper methods for generic string manipulation and formatting.
 */
export class StringUtils {
  /**
   * Capitalizes the first character of a string.
   */
  public static capitalize(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Converts a kebab, snake, or space-separated string to camelCase.
   */
  public static camelCase(str: string): string {
    if (!str) return "";
    const cleanStr = str.trim().replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));
    return cleanStr.charAt(0).toLowerCase() + cleanStr.slice(1);
  }

  /**
   * Converts a camelCase, snake, or space-separated string to kebab-case.
   */
  public static kebabCase(str: string): string {
    if (!str) return "";
    return str
      .trim()
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
      .replace(/[-_\s]+/g, "-")
      .toLowerCase();
  }

  /**
   * Converts a camelCase, kebab, or space-separated string to snake_case.
   */
  public static snakeCase(str: string): string {
    if (!str) return "";
    return str
      .trim()
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
      .replace(/[-_\s]+/g, "_")
      .toLowerCase();
  }

  /**
   * Truncates a string to a maximum length, appending an ellipsis symbol.
   */
  public static truncate(str: string, maxLength: number, ellipsis: string = "..."): string {
    if (!str || maxLength <= 0 || str.length <= maxLength) return str;
    return str.slice(0, maxLength) + ellipsis;
  }

  /**
   * Trims whitespace and normalizes internal multiple spaces and newlines to a single space.
   */
  public static normalizeWhitespace(str: string): string {
    if (!str) return "";
    return str.trim().replace(/\s+/g, " ");
  }
}
