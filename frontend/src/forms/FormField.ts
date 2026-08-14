/**
 * FormField tracking dirty checks, values, types, and error states.
 */
export class FormField {
  public isDirty: boolean = false;
  public error?: string;

  constructor(
    public readonly name: string,
    public value: any,
    public readonly type: string = "text",
    public readonly validators: any[] = []
  ) {}

  public setValue(val: any): void {
    this.value = val;
    this.isDirty = true;
  }
}
