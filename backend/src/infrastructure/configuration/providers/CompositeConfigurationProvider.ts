import { IConfigurationProvider } from "../../../foundation/contracts/system/IConfigurationProvider.js";
import { BaseConfigurationProvider } from "./BaseConfigurationProvider.js";

/**
 * Configuration provider combining multiple source providers.
 * Chains queries backwards so later providers override values in earlier ones.
 */
export class CompositeConfigurationProvider extends BaseConfigurationProvider {
  constructor(private readonly providers: IConfigurationProvider[]) {
    super();
  }

  protected getRaw(key: string): string | undefined {
    for (let i = this.providers.length - 1; i >= 0; i--) {
      const res = this.providers[i].get(key);
      if (res.isSuccess) {
        return res.value;
      }
    }
    return undefined;
  }
}
