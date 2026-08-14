import { ServerState } from "./ServerState.js";
import { ServerConfiguration } from "./ServerConfiguration.js";

/**
 * HttpServer wrapper coordinating ports routing, registration of middlewares, and status monitors.
 */
export class HttpServer {
  private state: ServerState = ServerState.STOPPED;
  private middleware: Array<(req: any, res: any, next: () => void) => void> = [];
  private routes: Array<{ path: string; method: string; handler: Function }> = [];

  constructor(public readonly config: ServerConfiguration) {}

  /**
   * Returns current operational state flag.
   */
  public getState(): ServerState {
    return this.state;
  }

  /**
   * Sets current operational state flag.
   */
  public setState(state: ServerState): void {
    this.state = state;
  }

  /**
   * Appends intermediate pipeline middlewares.
   */
  public registerMiddleware(middleware: (req: any, res: any, next: () => void) => void): void {
    this.middleware.push(middleware);
  }

  /**
   * Appends controllers routing handlers.
   */
  public registerRoutes(method: string, path: string, handler: Function): void {
    this.routes.push({ method, path, handler });
  }

  /**
   * Returns registered middleware list.
   */
  public getMiddleware(): Array<any> {
    return this.middleware;
  }

  /**
   * Returns registered routes list.
   */
  public getRoutes(): Array<any> {
    return this.routes;
  }

  /**
   * Opens HTTP ports and accepts payloads.
   */
  public async start(): Promise<void> {
    this.setState(ServerState.STARTING);
    // Simulates opening connection sockets
    this.setState(ServerState.RUNNING);
  }

  /**
   * Stops listening and drains request scopes.
   */
  public async stop(): Promise<void> {
    this.setState(ServerState.STOPPING);
    // Simulates closing sockets
    this.setState(ServerState.STOPPED);
  }
}
