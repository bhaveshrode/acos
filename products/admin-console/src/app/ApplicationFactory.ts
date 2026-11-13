import { ApplicationOptions } from "./ApplicationOptions.js";
import { ApplicationBootstrapper } from "./ApplicationBootstrapper.js";
import { ApplicationProviders } from "./ApplicationProviders.js";
import { App } from "./App.js";
import { RootLayout } from "./RootLayout.js";

/**
 * ApplicationFactory constructing application startup configurations and components.
 */
export class ApplicationFactory {
  public static createBootstrapper(options: ApplicationOptions): ApplicationBootstrapper {
    return new ApplicationBootstrapper(options);
  }

  public static createProviders(): ApplicationProviders {
    return new ApplicationProviders();
  }

  public static createApp(): App {
    return new App(new RootLayout());
  }
}
