/**
 * QueryParameterParser parsing and normalizing query string key-values.
 */
export class QueryParameterParser {
  public static parse(queryString: string): Record<string, string> {
    const params: Record<string, string> = {};
    const query = queryString.startsWith("?") ? queryString.substring(1) : queryString;
    if (!query) return params;

    const pairs = query.split("&");
    for (const pair of pairs) {
      const [key, value] = pair.split("=");
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || "");
      }
    }
    return params;
  }
}
