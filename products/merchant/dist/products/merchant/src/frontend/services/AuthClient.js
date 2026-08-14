import { BaseClient } from "./BaseClient.js";
export class AuthClient extends BaseClient {
    async signUp(email, passwordPlaintext, name) {
        this.ctx.logger.info("Frontend: Requesting Sign Up...", { email, name });
        const response = await this.ctx.backend.handleRequest("POST", "/auth/signup", {
            email,
            password: passwordPlaintext,
            name
        });
        if (response.status !== 201) {
            this.ctx.logger.warn("Frontend: Sign Up rejected by Backend", response.body);
            throw new Error(response.body.message || response.body.error || "Sign Up Failed");
        }
        this.ctx.logger.info("Frontend: Sign Up succeeded.", response.body);
        return response.body;
    }
    async login(email, passwordPlaintext) {
        this.ctx.logger.info("Frontend: Requesting Login...", { email });
        const response = await this.ctx.backend.handleRequest("POST", "/auth/login", {
            email,
            password: passwordPlaintext
        });
        if (response.status !== 200) {
            this.ctx.logger.warn("Frontend: Login failed", response.body);
            throw new Error(response.body.message || response.body.error || "Login Failed");
        }
        this.ctx.setSessionToken(response.body.token);
        this.ctx.logger.info("Frontend: Login succeeded. Token saved in session storage.");
        return response.body;
    }
    async logout() {
        this.ctx.logger.info("Frontend: Requesting Logout...");
        const headers = this.ctx.getHeaders();
        const token = this.ctx.getSessionToken();
        this.ctx.setSessionToken(null);
        if (!token) {
            this.ctx.logger.warn("Frontend: Logout requested but client has no active session.");
            return;
        }
        const response = await this.ctx.backend.handleRequest("POST", "/auth/logout", {}, headers);
        if (response.status !== 200) {
            this.ctx.logger.error("Frontend: Backend rejected session revocation", new Error(JSON.stringify(response.body)));
            throw new Error(response.body.message || response.body.error || "Logout Failed");
        }
        this.ctx.logger.info("Frontend: Logout succeeded.");
    }
    async queryMe() {
        this.ctx.logger.info("Frontend: Fetching active user profile details (/auth/me)...");
        const headers = this.ctx.getHeaders();
        const response = await this.ctx.backend.handleRequest("GET", "/auth/me", {}, headers);
        if (response.status !== 200) {
            this.ctx.logger.warn("Frontend: Failed to fetch profile /auth/me", response.body);
            throw new Error(response.body.message || response.body.error || "Me Query Failed");
        }
        this.ctx.logger.info("Frontend: User profile fetched successfully.", response.body);
        return response.body;
    }
}
