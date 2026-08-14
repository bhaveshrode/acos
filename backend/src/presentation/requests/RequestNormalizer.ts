/**
 * RequestNormalizer standardizing string values.
 */
export class RequestNormalizer {
  public normalize(data: Record<string, any>): Record<string, any> {
    const normalized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        const lower = value.toLowerCase();
        if (lower === "true") {
          normalized[key] = true;
        } else if (lower === "false") {
          normalized[key] = false;
        } else if (/^\d+$/.test(value)) {
          normalized[key] = parseInt(value, 10);
        } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          normalized[key] = new Date(value);
        } else {
          normalized[key] = value;
        }
      } else {
        normalized[key] = value;
      }
    }
    return normalized;
  }
}
