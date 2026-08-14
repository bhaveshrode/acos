import { BaseController } from "./BaseController.js";
export class InvoiceController extends BaseController {
    invoiceCache;
    constructor(acosBoundary, config, logger, invoiceCache) {
        super(acosBoundary, config, logger);
        this.invoiceCache = invoiceCache;
    }
    async handle(method, path, payload, headers) {
        if (method === "POST" && path === "/business/invoices") {
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
                    body: { error: "Bad Request: Business onboarding required before managing invoices." }
                };
            }
            if (!payload || !payload.customerId || !payload.invoiceNumber || !payload.lines) {
                return {
                    status: 400,
                    body: { error: "Bad Request: customerId, invoiceNumber, and lines are required." }
                };
            }
            try {
                const dto = {
                    ...payload,
                    organizationId: business.id
                };
                const invoice = await this.acosBoundary.createInvoice(userProfile.id, dto);
                return {
                    status: 201,
                    body: invoice
                };
            }
            catch (err) {
                this.logger.warn("Invoice registration rejected by boundary", { error: err.message });
                const isAccessDenied = err.message.includes("Access Denied");
                return {
                    status: isAccessDenied ? 403 : 400,
                    body: { error: isAccessDenied ? "Forbidden" : "Invoice Creation Failed", message: err.message }
                };
            }
        }
        if (method === "GET" && path === "/business/invoices") {
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
                const list = await this.acosBoundary.getInvoices(userProfile.id, business.id);
                return {
                    status: 200,
                    body: list
                };
            }
            catch (err) {
                return {
                    status: 400,
                    body: { error: "Fetch Invoices Failed", message: err.message }
                };
            }
        }
        if (method === "GET" &&
            path.startsWith("/business/invoices/") &&
            !path.endsWith("/issue") &&
            !path.endsWith("/send") &&
            !path.endsWith("/collect-payment")) {
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
            const invoiceId = path.substring("/business/invoices/".length);
            if (!invoiceId || invoiceId.trim() === "") {
                return {
                    status: 400,
                    body: { error: "Bad Request: Invoice ID is required." }
                };
            }
            try {
                if (this.invoiceCache.has(invoiceId)) {
                    this.logger.info(`Returning cached invoice: ${invoiceId}`);
                    return {
                        status: 200,
                        body: this.invoiceCache.get(invoiceId)
                    };
                }
                const invoice = await this.acosBoundary.getInvoiceById(userProfile.id, invoiceId);
                this.invoiceCache.set(invoiceId, invoice);
                return {
                    status: 200,
                    body: invoice
                };
            }
            catch (err) {
                this.logger.warn("Fetch invoice by ID rejected", { invoiceId, error: err.message });
                const isAccessDenied = err.message.includes("Access Denied");
                return {
                    status: isAccessDenied ? 403 : 404,
                    body: { error: isAccessDenied ? "Forbidden" : "Not Found", message: err.message }
                };
            }
        }
        if (method === "POST" && path.startsWith("/business/invoices/") && path.endsWith("/issue")) {
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
            const invoiceId = path.substring("/business/invoices/".length, path.length - "/issue".length);
            try {
                const invoice = await this.acosBoundary.issueInvoice(userProfile.id, invoiceId);
                this.invoiceCache.delete(invoiceId);
                return {
                    status: 200,
                    body: invoice
                };
            }
            catch (err) {
                this.logger.warn("Issue invoice rejected", { invoiceId, error: err.message });
                const isAccessDenied = err.message.includes("Access Denied");
                const isNotFound = err.message.includes("not found");
                return {
                    status: isAccessDenied ? 403 : (isNotFound ? 404 : 400),
                    body: { error: isAccessDenied ? "Forbidden" : "Issue Failed", message: err.message }
                };
            }
        }
        if (method === "POST" && path.startsWith("/business/invoices/") && path.endsWith("/send")) {
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
            const invoiceId = path.substring("/business/invoices/".length, path.length - "/send".length);
            try {
                const invoice = await this.acosBoundary.sendInvoice(userProfile.id, invoiceId);
                this.invoiceCache.delete(invoiceId);
                return {
                    status: 200,
                    body: invoice
                };
            }
            catch (err) {
                this.logger.warn("Send invoice rejected", { invoiceId, error: err.message });
                const isAccessDenied = err.message.includes("Access Denied");
                const isNotFound = err.message.includes("not found");
                return {
                    status: isAccessDenied ? 403 : (isNotFound ? 404 : 400),
                    body: { error: isAccessDenied ? "Forbidden" : "Send Failed", message: err.message }
                };
            }
        }
        return null;
    }
}
