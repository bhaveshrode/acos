import { BaseController } from "./BaseController.js";
export class BusinessController extends BaseController {
    dashboardCache;
    constructor(acosBoundary, config, logger, dashboardCache) {
        super(acosBoundary, config, logger);
        this.dashboardCache = dashboardCache;
    }
    async handle(method, path, payload, headers) {
        if (method === "POST" && path === "/business/onboarding") {
            const token = this.extractBearerToken(headers);
            if (!token) {
                return {
                    status: 401,
                    body: { error: "Unauthorized: Missing or malformed session token." }
                };
            }
            let userProfile;
            try {
                userProfile = await this.acosBoundary.me(token);
            }
            catch (err) {
                return {
                    status: 401,
                    body: { error: "Unauthorized", message: err.message }
                };
            }
            if (!payload || !payload.name || !payload.slug) {
                return {
                    status: 400,
                    body: { error: "Bad Request: Business name and slug are required." }
                };
            }
            try {
                const business = await this.acosBoundary.onboardBusiness(userProfile.id, payload.name, payload.slug, payload.currency || "USD", payload.businessType || "Retail", payload.country || "USA", payload.contactInfo || "");
                return {
                    status: 201,
                    body: business
                };
            }
            catch (err) {
                this.logger.warn("Business Onboarding Failed", { error: err.message });
                return {
                    status: 400,
                    body: { error: "Onboarding Failed", message: err.message }
                };
            }
        }
        if (method === "GET" && path === "/business") {
            const token = this.extractBearerToken(headers);
            if (!token) {
                return {
                    status: 401,
                    body: { error: "Unauthorized: Missing or malformed session token." }
                };
            }
            let userProfile;
            try {
                userProfile = await this.acosBoundary.me(token);
            }
            catch (err) {
                return {
                    status: 401,
                    body: { error: "Unauthorized", message: err.message }
                };
            }
            try {
                const business = await this.acosBoundary.getBusinessForUser(userProfile.id);
                if (!business) {
                    return {
                        status: 404,
                        body: { error: "No active business context found for this user." }
                    };
                }
                return {
                    status: 200,
                    body: business
                };
            }
            catch (err) {
                this.logger.error("Fetch business failed", err);
                return {
                    status: 500,
                    body: { error: "Internal Server Error", message: err.message }
                };
            }
        }
        if (method === "GET" && path === "/business/dashboard") {
            const token = this.extractBearerToken(headers);
            if (!token) {
                return {
                    status: 401,
                    body: { error: "Unauthorized: Missing session token." }
                };
            }
            let userProfile;
            try {
                userProfile = await this.acosBoundary.me(token);
            }
            catch (err) {
                return {
                    status: 401,
                    body: { error: "Unauthorized", message: err.message }
                };
            }
            const business = await this.acosBoundary.getBusinessForUser(userProfile.id);
            if (!business) {
                return {
                    status: 400,
                    body: { error: "Bad Request: Business onboarding required." }
                };
            }
            try {
                if (this.dashboardCache.has(business.id)) {
                    this.logger.info(`Returning cached dashboard: ${business.id}`);
                    return {
                        status: 200,
                        body: this.dashboardCache.get(business.id)
                    };
                }
                const dashboard = await this.acosBoundary.getDashboard(userProfile.id, business.id);
                this.dashboardCache.set(business.id, dashboard);
                return {
                    status: 200,
                    body: dashboard
                };
            }
            catch (err) {
                this.logger.error("Fetch dashboard metrics failed", err);
                return {
                    status: 500,
                    body: { error: "Internal Server Error", message: err.message }
                };
            }
        }
        return null;
    }
}
