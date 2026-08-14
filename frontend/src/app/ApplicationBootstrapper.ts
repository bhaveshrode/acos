import { ApplicationOptions } from "./ApplicationOptions.js";
import { ApplicationContext } from "./ApplicationContext.js";
import { ApplicationState } from "./ApplicationState.js";
import { ApplicationInitializer } from "./ApplicationInitializer.js";
import { ApplicationShutdown } from "./ApplicationShutdown.js";

/**
 * ApplicationBootstrapper orchestrating the startup/shutdown pipeline flow.
 */
export class ApplicationBootstrapper {
  private context?: ApplicationContext;

  constructor(private readonly options: ApplicationOptions) {}

  public async start(): Promise<ApplicationContext> {
    const state = new ApplicationState();
    this.context = new ApplicationContext(this.options, state);

    const initializer = new ApplicationInitializer();
    await initializer.initialize(this.context);

    return this.context;
  }

  public async stop(): Promise<void> {
    if (this.context) {
      const shutdown = new ApplicationShutdown();
      await shutdown.shutdown(this.context);
    }
  }

  public getContext(): ApplicationContext {
    if (!this.context) {
      throw new Error("ApplicationBootstrapper has not been started");
    }
    return this.context;
  }
}
