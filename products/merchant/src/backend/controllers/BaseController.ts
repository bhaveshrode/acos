import { AcosIntegrationBoundary } from "../../integration/AcosIntegrationBoundary.js";

export abstract class BaseController {
  constructor(
    protected readonly acosBoundary: AcosIntegrationBoundary,
    protected readonly config: any,
    protected readonly logger: any
  ) {}

  /**
   * Helper to extract token from authorization header (Bearer) or session cookie.
   */
  public extractBearerToken(headers?: Record<string, string>): string | null {
    if (!headers) {
      return null;
    }

    // 1. Try Bearer token
    const authHeader = headers["Authorization"] || headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    // 2. Try Cookie header (session_token=...)
    const cookieHeader = headers["Cookie"] || headers["cookie"];
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map((c) => c.trim());
      for (const cookie of cookies) {
        const [name, val] = cookie.split("=");
        if (name === "session_token" && val) {
          return val;
        }
      }
    }

    return null;
  }
}
