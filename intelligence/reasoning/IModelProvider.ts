export interface IModelProvider {
  readonly providerName: string;
  generate(prompt: string, context?: any): Promise<string>;
}
