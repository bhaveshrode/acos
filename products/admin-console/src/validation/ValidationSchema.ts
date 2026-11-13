import { IValidationRule } from "./IValidationRule.js";

/**
 * ValidationSchema grouping validation rules per property path.
 */
export class ValidationSchema {
  private readonly rulesMap = new Map<string, IValidationRule[]>();

  public addRule(property: string, rule: IValidationRule): void {
    if (!this.rulesMap.has(property)) {
      this.rulesMap.set(property, []);
    }
    this.rulesMap.get(property)!.push(rule);
  }

  public getRules(property: string): IValidationRule[] {
    return this.rulesMap.get(property) || [];
  }

  public getProperties(): string[] {
    return Array.from(this.rulesMap.keys());
  }
}
