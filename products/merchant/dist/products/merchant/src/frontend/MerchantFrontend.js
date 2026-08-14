import { Logger } from "../../../../backend/src/foundation/logging/Logger.js";
import { AuthClient } from "./services/AuthClient.js";
import { CustomerClient } from "./services/CustomerClient.js";
import { InvoiceClient } from "./services/InvoiceClient.js";
import { PaymentClient } from "./services/PaymentClient.js";
import { SystemClient } from "./services/SystemClient.js";
export class MerchantFrontend {
    backend;
    logger;
    sessionToken = null;
    // Domain service client instances
    authClient;
    customerClient;
    invoiceClient;
    paymentClient;
    systemClient;
    constructor(backend, logWriter) {
        this.backend = backend;
        this.logger = new Logger("MerchantFrontend", logWriter);
        // Build the decoupled context wrapper
        const ctx = {
            getHeaders: () => this.getHeaders(),
            getSessionToken: () => this.getSessionToken(),
            setSessionToken: (token) => {
                this.sessionToken = token;
            },
            backend: this.backend,
            logger: this.logger
        };
        this.authClient = new AuthClient(ctx);
        this.customerClient = new CustomerClient(ctx);
        this.invoiceClient = new InvoiceClient(ctx);
        this.paymentClient = new PaymentClient(ctx);
        this.systemClient = new SystemClient(ctx);
    }
    /**
     * Retrieves the current simulated client session token.
     */
    getSessionToken() {
        return this.sessionToken;
    }
    /**
     * Clears the current client session token manually.
     */
    clearSessionToken() {
        this.sessionToken = null;
    }
    /**
     * Helper to build request headers including Bearer token if authenticated.
     */
    getHeaders() {
        const headers = {};
        if (this.sessionToken) {
            headers["Authorization"] = `Bearer ${this.sessionToken}`;
        }
        return headers;
    }
    // Auth operations
    signUp(email, passwordPlaintext, name) {
        return this.authClient.signUp(email, passwordPlaintext, name);
    }
    login(email, passwordPlaintext) {
        return this.authClient.login(email, passwordPlaintext);
    }
    logout() {
        return this.authClient.logout();
    }
    queryMe() {
        return this.authClient.queryMe();
    }
    // Business context onboarding operations
    onboardBusiness(name, slug, currency = "USD", businessType = "Retail", country = "USA", contactInfo = "") {
        return this.systemClient.onboardBusiness(name, slug, currency, businessType, country, contactInfo);
    }
    queryBusiness() {
        return this.systemClient.queryBusiness();
    }
    queryDashboard() {
        return this.systemClient.queryDashboard();
    }
    // Customer operations
    createCustomer(payload) {
        return this.customerClient.createCustomer(payload);
    }
    listCustomers() {
        return this.customerClient.listCustomers();
    }
    getCustomer(id) {
        return this.customerClient.getCustomer(id);
    }
    // Invoice operations
    createInvoice(payload) {
        return this.invoiceClient.createInvoice(payload);
    }
    listInvoices() {
        return this.invoiceClient.listInvoices();
    }
    getInvoice(id) {
        return this.invoiceClient.getInvoice(id);
    }
    issueInvoice(id) {
        return this.invoiceClient.issueInvoice(id);
    }
    sendInvoice(id) {
        return this.invoiceClient.sendInvoice(id);
    }
    // Payment operations
    collectPayment(invoiceId, amount) {
        return this.paymentClient.collectPayment(invoiceId, amount);
    }
    simulateWebhook(gatewayReference, success, errorCode, errorMessage) {
        return this.paymentClient.simulateWebhook(gatewayReference, success, errorCode, errorMessage);
    }
    getPayment(id) {
        return this.paymentClient.getPayment(id);
    }
    listPayments() {
        return this.paymentClient.listPayments();
    }
    // Health and connection check utility methods
    queryHealth() {
        return this.systemClient.queryHealth();
    }
    queryAcosConnectivityStatus() {
        return this.systemClient.queryAcosConnectivityStatus();
    }
    triggerSimulatedError() {
        return this.systemClient.triggerSimulatedError();
    }
    triggerUnknownRoute() {
        return this.systemClient.triggerUnknownRoute();
    }
}
