/**
 * Domain Service resolving variables inside standard message templates.
 */
export class NotificationTemplatePolicy {
  /**
   * Replaces placeholders like {{key}} in template text with value parameters.
   */
  public resolveTemplate(templateText: string, variables: Record<string, string>): string {
    let resolved = templateText;
    for (const [key, val] of Object.entries(variables)) {
      resolved = resolved.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g"), val);
    }
    return resolved;
  }
}
