import { ValidationError } from "./ValidationError.js";

/**
 * ValidationErrorCollection grouping errors by property and validation scope.
 */
export class ValidationErrorCollection {
  private readonly list: ValidationError[] = [];

  public add(error: ValidationError): void {
    this.list.push(error);
  }

  public getForProperty(property: string): ValidationError[] {
    return this.list.filter((e) => e.property === property);
  }

  public getAll(): ValidationError[] {
    return [...this.list];
  }
}
