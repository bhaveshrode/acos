import { BaseController } from "./BaseController.js";
export class SystemController extends BaseController {
    async handle(method, path, payload, headers) {
        if (method === "GET" && path === "/health") {
            let databaseHealthy = true;
            const prisma = this.acosBoundary.prismaClient;
            if (prisma) {
                try {
                    await prisma.$queryRaw `SELECT 1`;
                }
                catch (err) {
                    databaseHealthy = false;
                    this.logger.error("Health check database query failed", err);
                }
            }
            const acosConnectivity = await this.acosBoundary.checkConnectivity();
            const overallHealthy = acosConnectivity.connected && databaseHealthy;
            return {
                status: overallHealthy ? 200 : 503,
                body: {
                    status: overallHealthy ? "UP" : "DOWN",
                    environment: this.config.env,
                    port: this.config.port,
                    timestamp: new Date().toISOString(),
                    checks: {
                        database: databaseHealthy ? "HEALTHY" : "UNHEALTHY",
                        acosSubsystems: acosConnectivity.connected ? "CONNECTED" : "DISCONNECTED"
                    }
                }
            };
        }
        if (method === "GET" && path === "/acos-status") {
            const acosConnectivity = await this.acosBoundary.checkConnectivity();
            if (acosConnectivity.connected) {
                return {
                    status: 200,
                    body: {
                        status: "CONNECTED",
                        acosSubsystems: acosConnectivity.subsystems,
                        acosHealth: acosConnectivity.health
                    }
                };
            }
            else {
                this.logger.error("ACOS connection check reported failure", new Error(acosConnectivity.error));
                return {
                    status: 502,
                    body: {
                        status: "DISCONNECTED",
                        error: acosConnectivity.error
                    }
                };
            }
        }
        if (method === "POST" && path === "/simulate-error") {
            throw new Error("Simulated internal server exception.");
        }
        return null;
    }
}
