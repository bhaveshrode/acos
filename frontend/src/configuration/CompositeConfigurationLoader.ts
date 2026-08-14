import { IConfigurationLoader } from "./IConfigurationLoader.js";

/**
 * CompositeConfigurationLoader merging multiple loaders config inputs.
 */
export class CompositeConfigurationLoader implements IConfigurationLoader {
  constructor(private readonly loaders: IConfigurationLoader[]) {}

  public load(): Record<string, any> {
    let merged: Record<string, any> = {};
    for (const loader of this.loaders) {
      const data = loader.load();
      merged = this.deepMerge(merged, data);
    }
    return merged;
  }

  private deepMerge(target: any, source: any): any {
    const output = Object.assign({}, target);
    if (target && typeof target === "object" && source && typeof source === "object") {
      Object.keys(source).forEach((key) => {
        if (source[key] && typeof source[key] === "object") {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }
}
