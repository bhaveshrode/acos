"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingFactory = void 0;
const LogEntry_js_1 = require("./LogEntry.js");
const LogAggregator_js_1 = require("./LogAggregator.js");
const LokiLogExporter_js_1 = require("./LokiLogExporter.js");
/**
 * LoggingFactory building log entities and aggregators.
 */
class LoggingFactory {
    static createEntry(level, message, metadata) {
        return new LogEntry_js_1.LogEntry(level, message, Date.now(), metadata);
    }
    static createAggregator() {
        return new LogAggregator_js_1.LogAggregator();
    }
    static createLokiExporter() {
        return new LokiLogExporter_js_1.LokiLogExporter();
    }
    createEntry(level, message, metadata) {
        return LoggingFactory.createEntry(level, message, metadata);
    }
    createAggregator() {
        return LoggingFactory.createAggregator();
    }
    createLokiExporter() {
        return LoggingFactory.createLokiExporter();
    }
}
exports.LoggingFactory = LoggingFactory;
