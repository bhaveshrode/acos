import { BaseController } from "./BaseController.js";
export class AuthController extends BaseController {
    async handle(method, path, payload, headers) {
        if (method === "POST" && path === "/auth/signup") {
            if (!payload || !payload.email || !payload.password || !payload.name) {
                return {
                    status: 400,
                    body: { error: "Bad Request: email, password, and name are required." }
                };
            }
            try {
                const userDto = await this.acosBoundary.signUp(payload.email, payload.password, payload.name);
                return {
                    status: 201,
                    body: userDto
                };
            }
            catch (err) {
                this.logger.warn("SignUp request rejected by ACOS", { error: err.message });
                return {
                    status: 400,
                    body: { error: "Sign Up Failed", message: err.message }
                };
            }
        }
        if (method === "POST" && path === "/auth/login") {
            if (!payload || !payload.email || !payload.password) {
                return {
                    status: 400,
                    body: { error: "Bad Request: email and password are required." }
                };
            }
            try {
                const ipAddress = headers?.["x-forwarded-for"] || "127.0.0.1";
                const authResult = await this.acosBoundary.login(payload.email, payload.password, ipAddress);
                return {
                    status: 200,
                    body: authResult
                };
            }
            catch (err) {
                this.logger.warn("Login attempt rejected", { error: err.message });
                return {
                    status: 401,
                    body: { error: "Unauthorized", message: err.message }
                };
            }
        }
        if (method === "POST" && path === "/auth/logout") {
            const token = this.extractBearerToken(headers);
            if (!token) {
                return {
                    status: 401,
                    body: { error: "Unauthorized: Missing or malformed authorization token." }
                };
            }
            try {
                await this.acosBoundary.logout(token);
                return {
                    status: 200,
                    body: { status: "LOGGED_OUT", message: "Session revoked successfully." }
                };
            }
            catch (err) {
                return {
                    status: 400,
                    body: { error: "Logout failed", message: err.message }
                };
            }
        }
        if (method === "GET" && path === "/auth/me") {
            const token = this.extractBearerToken(headers);
            if (!token) {
                return {
                    status: 401,
                    body: { error: "Unauthorized: Missing or malformed authorization token." }
                };
            }
            try {
                const profile = await this.acosBoundary.me(token);
                return {
                    status: 200,
                    body: profile
                };
            }
            catch (err) {
                this.logger.warn("Get profile me failed", { error: err.message });
                return {
                    status: 401,
                    body: { error: "Unauthorized", message: err.message }
                };
            }
        }
        return null;
    }
}
