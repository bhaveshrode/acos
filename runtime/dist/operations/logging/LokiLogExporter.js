"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LokiLogExporter = void 0;
/**
 * LokiLogExporter exporting packets payloads to log servers.
 */
class LokiLogExporter {
    async export(entries) {
        return entries.length > 0;
    }
}
exports.LokiLogExporter = LokiLogExporter;
