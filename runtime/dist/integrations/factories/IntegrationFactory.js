"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationFactory = void 0;
const IntegrationComposition_js_1 = require("./IntegrationComposition.js");
/**
 * IntegrationFactory acting as the central composition root gateway for external adapters.
 */
class IntegrationFactory {
    composition;
    constructor(composition = new IntegrationComposition_js_1.IntegrationComposition()) {
        this.composition = composition;
    }
    get payments() {
        return this.composition.payments;
    }
    get blockchain() {
        return this.composition.blockchain;
    }
    get communications() {
        return this.composition.communications;
    }
    get identity() {
        return this.composition.identity;
    }
    get cloud() {
        return this.composition.cloud;
    }
    get accounting() {
        return this.composition.accounting;
    }
    get crm() {
        return this.composition.crm;
    }
    get ecommerce() {
        return this.composition.ecommerce;
    }
    get storage() {
        return this.composition.storage;
    }
    get webhooks() {
        return this.composition.webhooks;
    }
    get synchronization() {
        return this.composition.synchronization;
    }
    get security() {
        return this.composition.security;
    }
    get configuration() {
        return this.composition.configuration;
    }
    get monitoring() {
        return this.composition.monitoring;
    }
}
exports.IntegrationFactory = IntegrationFactory;
