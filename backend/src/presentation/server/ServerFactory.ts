import { ServerConfiguration } from "./ServerConfiguration.js";
import { HttpServer } from "./HttpServer.js";
import { ShutdownManager } from "./ShutdownManager.js";

/**
 * ServerFactory class centralizing instantiation of Http servers and shutdown orchestrators.
 */
export class ServerFactory {
  /**
   * Instantiates an HttpServer from config definitions.
   */
  public static createServer(config: ServerConfiguration): HttpServer {
    return new HttpServer(config);
  }

  /**
   * Instantiates a ShutdownManager coupled to the HttpServer's shutdown commands.
   */
  public static createShutdownManager(server: HttpServer): ShutdownManager {
    return new ShutdownManager(() => server.stop());
  }
}
