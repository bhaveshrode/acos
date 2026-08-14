import { ClaimsPrincipal } from "./ClaimsPrincipal.js";

/**
 * ClaimsMapper parsing ClaimsPrincipal structures from JWT string tokens.
 */
export class ClaimsMapper {
  public static mapFromToken(token: string): ClaimsPrincipal {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        // Decode base64 payload segment
        const payloadJson = atob(parts[1]);
        const payload = JSON.parse(payloadJson);
        return new ClaimsPrincipal(
          payload.sub || payload.userId || "unknown",
          payload
        );
      }
    } catch {
      // Fallback
    }
    return new ClaimsPrincipal("unknown", {});
  }
}
