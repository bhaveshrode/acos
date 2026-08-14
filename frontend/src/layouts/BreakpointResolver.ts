/**
 * BreakpointResolver resolving viewport classifications (Mobile, Tablet, Desktop) based on screen width values.
 */
export class BreakpointResolver {
  public static resolve(width: number): "Mobile" | "Tablet" | "Desktop" {
    if (width < 768) return "Mobile";
    if (width < 1024) return "Tablet";
    return "Desktop";
  }
}
