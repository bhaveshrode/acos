/**
 * Regex-based string binder rendering html/text templates.
 */
export class TemplateRenderer {
  /**
   * Binds context parameters recursively into target double curly braces (e.g. {{customerName}}).
   */
  public static render(template: string, variables: Record<string, any>): string {
    let rendered = template;
    for (const key in variables) {
      if (Object.prototype.hasOwnProperty.call(variables, key)) {
        const value = variables[key];
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        rendered = rendered.replace(regex, String(value ?? ""));
      }
    }
    return rendered;
  }
}
