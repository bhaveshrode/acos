/**
 * ValidationMessageFormatter interpolating custom rule parameters into templates.
 */
export class ValidationMessageFormatter {
  public static format(template: string, params: Record<string, any>): string {
    let formatted = template;
    for (const [key, val] of Object.entries(params)) {
      formatted = formatted.replace(new RegExp(`\\{${key}\\}`, "g"), String(val));
    }
    return formatted;
  }
}
