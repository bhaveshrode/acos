import { HttpServer } from "./HttpServer.js";
import { ServerConfiguration } from "./ServerConfiguration.js";

/**
 * ServerBuilder building server configurations and pipelines fluently.
 */
export class ServerBuilder {
  private config = new ServerConfiguration();
  private middleware: Array<any> = [];

  /**
   * Assigns ServerConfiguration settings parameters.
   */
  public withConfiguration(config: ServerConfiguration): this {
    this.config = config;
    return this;
  }

  /**
   * Registers a middleware callback handler.
   */
  public withMiddleware(middleware: any): this {
    this.middleware.push(middleware);
    return this;
  }

  /**
   * Assembles and builds the HttpServer instance.
   */
  public build(): HttpServer {
    const server = new HttpServer(this.config);
    for (const m of this.middleware) {
      server.registerMiddleware(m);
    }
    return server;
  }
}
