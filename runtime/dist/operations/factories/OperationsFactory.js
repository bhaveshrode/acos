"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationsFactory = void 0;
const OperationsComposition_js_1 = require("./OperationsComposition.js");
/**
 * OperationsFactory composition gateway routing subcomponent instances to operations clients.
 */
class OperationsFactory {
    composition;
    constructor(composition = new OperationsComposition_js_1.OperationsComposition()) {
        this.composition = composition;
    }
    get deployment() {
        return this.composition.deployment;
    }
    get containers() {
        return this.composition.containers;
    }
    get monitoring() {
        return this.composition.monitoring;
    }
    get logging() {
        return this.composition.logging;
    }
    get tracing() {
        return this.composition.tracing;
    }
    get metrics() {
        return this.composition.metrics;
    }
    get secrets() {
        return this.composition.secrets;
    }
    get scheduler() {
        return this.composition.scheduler;
    }
    get backups() {
        return this.composition.backups;
    }
    get scaling() {
        return this.composition.scaling;
    }
    get gateway() {
        return this.composition.gateway;
    }
    get observability() {
        return this.composition.observability;
    }
    get diagnostics() {
        return this.composition.diagnostics;
    }
    get maintenance() {
        return this.composition.maintenance;
    }
}
exports.OperationsFactory = OperationsFactory;
