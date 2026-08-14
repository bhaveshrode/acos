"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityFactory = void 0;
const TelemetryCoordinator_js_1 = require("./TelemetryCoordinator.js");
/**
 * ObservabilityFactory composing monitoring components and coordinators.
 */
class ObservabilityFactory {
    static createCoordinator(logger, metrics, tracer) {
        return new TelemetryCoordinator_js_1.TelemetryCoordinator(logger, metrics, tracer);
    }
    createCoordinator(logger, metrics, tracer) {
        return ObservabilityFactory.createCoordinator(logger, metrics, tracer);
    }
}
exports.ObservabilityFactory = ObservabilityFactory;
