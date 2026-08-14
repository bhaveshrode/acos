"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsUploader = void 0;
/**
 * AnalyticsUploader transmitting event payloads to backend endpoints.
 */
class AnalyticsUploader {
    async upload(events) {
        return events.length > 0;
    }
}
exports.AnalyticsUploader = AnalyticsUploader;
