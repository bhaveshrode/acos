import { DeveloperComposition } from "./DeveloperComposition.js";

export class DeveloperFactory {
  constructor(
    public readonly composition: DeveloperComposition = new DeveloperComposition()
  ) {}

  public get documentation() {
    return this.composition.documentation;
  }

  public get sdk() {
    return this.composition.sdk;
  }

  public get cli() {
    return this.composition.cli;
  }

  public get generator() {
    return this.composition.generator;
  }

  public get playground() {
    return this.composition.playground;
  }
}
