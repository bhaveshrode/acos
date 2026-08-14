import { CodeGenerator } from "../generators/CodeGenerator.js";

export class GeneratorFactory {
  public createGenerator(): CodeGenerator {
    return new CodeGenerator();
  }
}
