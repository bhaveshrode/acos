import { ServerBuilder } from "./ServerBuilder.js";
import { ServerConfiguration } from "./ServerConfiguration.js";
import { HttpServer } from "./HttpServer.js";
import { ServerLifecycle } from "./ServerLifecycle.js";
import { StartupValidator } from "./StartupValidator.js";

/**
 * Bootstrapper class serving as the application startup coordinator.
 */
export class Bootstrapper {
  /**
   * Loads configurations, validates infrastructure dependencies, registers controllers, and starts the server.
   */
  public static async bootstrap(config: ServerConfiguration): Promise<HttpServer> {
    await ServerLifecycle.emit("starting");

    const validationRes = await StartupValidator.validate();
    if (validationRes.isFailure) {
      await ServerLifecycle.emit("failed");
      throw new Error("Startup validation failed.");
    }

    const server = new ServerBuilder()
      .withConfiguration(config)
      .build();

    await server.start();
    await ServerLifecycle.emit("started");

    return server;
  }
}
