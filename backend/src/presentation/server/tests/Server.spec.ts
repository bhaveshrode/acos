import { describe, it, expect, beforeEach, vi } from "vitest";
import { ServerState } from "../ServerState.js";
import { ServerContext } from "../ServerContext.js";
import { ServerConfiguration } from "../ServerConfiguration.js";
import { ServerLifecycle } from "../ServerLifecycle.js";
import { StartupValidator } from "../StartupValidator.js";
import { ShutdownManager } from "../ShutdownManager.js";
import { HttpServer } from "../HttpServer.js";
import { ServerBuilder } from "../ServerBuilder.js";
import { Bootstrapper } from "../Bootstrapper.js";
import { ServerFactory } from "../ServerFactory.js";

describe("Presentation Server Module Tests (Task 38.8)", () => {
  beforeEach(() => {
    ServerLifecycle.reset();
  });

  describe("ServerState & ServerContext", () => {
    it("should initialize server metadata context properly", () => {
      const startup = new Date();
      const ctx = new ServerContext({
        startupTime: startup,
        version: "v1.0.0",
        environment: "production",
        host: "localhost",
        port: 8080,
        buildNumber: "45",
        correlationId: "corr-1"
      });

      expect(ctx.props.startupTime).toBe(startup);
      expect(ctx.props.port).toBe(8080);
      expect(ctx.props.environment).toBe("production");
    });
  });

  describe("ServerConfiguration defaults", () => {
    it("should fallback to default settings if no options specified", () => {
      const config = new ServerConfiguration();
      expect(config.port).toBe(3000);
      expect(config.host).toBe("localhost");
      expect(config.corsEnabled).toBe(true);
      expect(config.requestTimeout).toBe(30000);
    });
  });

  describe("ServerLifecycle", () => {
    it("should coordinate starting, started, stopping, stopped callbacks", async () => {
      let startedTriggered = false;
      let stoppedTriggered = false;

      ServerLifecycle.on("started", () => {
        startedTriggered = true;
      });
      ServerLifecycle.on("stopped", () => {
        stoppedTriggered = true;
      });

      await ServerLifecycle.emit("started");
      await ServerLifecycle.emit("stopped");

      expect(startedTriggered).toBe(true);
      expect(stoppedTriggered).toBe(true);
    });
  });

  describe("StartupValidator & ShutdownManager", () => {
    it("should successfully run validator checks", async () => {
      const res = await StartupValidator.validate();
      expect(res.isSuccess).toBe(true);
    });

    it("should coordinate shutdown triggers", async () => {
      let closeCalled = false;
      const shutdownManager = new ShutdownManager(async () => {
        closeCalled = true;
      });

      await shutdownManager.shutdown();
      expect(closeCalled).toBe(true);
    });
  });

  describe("HttpServer & ServerBuilder", () => {
    it("should configure middleware and routes correctly via builder", async () => {
      const middlewareMock = (req: any, res: any, next: () => void) => next();
      const routeHandlerMock = () => {};

      const config = new ServerConfiguration(4000);
      const builder = new ServerBuilder()
        .withConfiguration(config)
        .withMiddleware(middlewareMock);

      const server = builder.build();
      server.registerRoutes("GET", "/health", routeHandlerMock);

      expect(server.config.port).toBe(4000);
      expect(server.getMiddleware()).toContain(middlewareMock);
      expect(server.getRoutes()[0].path).toBe("/health");

      expect(server.getState()).toBe(ServerState.STOPPED);
      await server.start();
      expect(server.getState()).toBe(ServerState.RUNNING);

      await server.stop();
      expect(server.getState()).toBe(ServerState.STOPPED);
    });
  });

  describe("Bootstrapper main pipeline", () => {
    it("should run complete bootstrap sequence and emit hook signals", async () => {
      let startingLogged = false;
      let startedLogged = false;

      ServerLifecycle.on("starting", () => {
        startingLogged = true;
      });
      ServerLifecycle.on("started", () => {
        startedLogged = true;
      });

      const config = new ServerConfiguration(5000);
      const server = await Bootstrapper.bootstrap(config);

      expect(server.config.port).toBe(5000);
      expect(server.getState()).toBe(ServerState.RUNNING);
      expect(startingLogged).toBe(true);
      expect(startedLogged).toBe(true);

      await server.stop();
    });
  });

  describe("ServerFactory creation checks", () => {
    it("should construct servers and shutdown instances via factory builders", () => {
      const config = new ServerConfiguration(6000);
      const server = ServerFactory.createServer(config);
      const shutdownManager = ServerFactory.createShutdownManager(server);

      expect(server).toBeInstanceOf(HttpServer);
      expect(shutdownManager).toBeInstanceOf(ShutdownManager);
    });
  });
});
