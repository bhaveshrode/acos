import { Logger } from "../../../backend/src/foundation/logging/Logger.js";
import { Mediator } from "../../../backend/src/application/foundation/pipeline/Mediator.js";
import { SubsystemDescriptor, RuntimeFactory } from "acos-runtime";
import { MerchantConfig } from "./configuration/MerchantConfig.js";
import { AcosIntegrationBoundary } from "./integration/AcosIntegrationBoundary.js";
import { MerchantBackend } from "./backend/MerchantBackend.js";
// Standard console log writer for staging/production
const writer = (entry) => {
    const timestamp = entry.timestamp.toISOString();
    const errorSuffix = entry.error ? `\nError: ${entry.error.message}\nStack: ${entry.error.stack}` : "";
    console.log(`[${timestamp}] [${entry.level}] [${entry.context.moduleName || "ACOS"}] ${entry.message}${errorSuffix}`);
};
const mainLogger = new Logger("AcosStartup", writer);
async function startServer() {
    mainLogger.info("Reading environment configuration...");
    const config = MerchantConfig.loadFromEnv();
    mainLogger.info("Setting up ACOS Runtime Subsystems Mock Factory...");
    const runtimeFactory = new RuntimeFactory();
    const backendMediator = new Mediator();
    runtimeFactory.registry.register(new SubsystemDescriptor("backend", [], backendMediator));
    runtimeFactory.health.registerCheck("backend", async () => ({
        name: "backend",
        healthy: true
    }));
    mainLogger.info("Initializing ACOS Integration Boundary...");
    const boundaryLogger = new Logger("AcosDbBoundary", writer);
    const boundary = new AcosIntegrationBoundary(boundaryLogger, runtimeFactory);
    mainLogger.info("Instantiating Merchant Backend Server...");
    const backend = new MerchantBackend(config, boundary, writer);
    // Connect boundary and start server
    mainLogger.info("Connecting to Database and starting subsystems...");
    await boundary.connect(config.env, config.dbUrl || undefined);
    await backend.start();
    mainLogger.info(`ACOS Merchant V1 is running and listening on port ${config.port}`);
    // Handle graceful shutdown
    const shutdown = async (signal) => {
        mainLogger.info(`Received ${signal}. Shutting down gracefully...`);
        try {
            await backend.stop();
            await boundary.disconnect();
            mainLogger.info("Graceful shutdown completed successfully.");
            process.exit(0);
        }
        catch (err) {
            mainLogger.error("Error occurred during graceful shutdown", err);
            process.exit(1);
        }
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
}
startServer().catch((err) => {
    mainLogger.critical("Fatal server startup failure", err);
    process.exit(1);
});
