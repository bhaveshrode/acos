import { SecurityAuditRecord } from "./SecurityAuditRecord.js";
import { SecurityEventClassifier } from "./SecurityEventClassifier.js";
/**
 * SecurityEventLogger logging and routing security exceptions.
 */
export class SecurityEventLogger {
    collector;
    classifier = new SecurityEventClassifier();
    constructor(collector) {
        this.collector = collector;
    }
    logEvent(eventId, category, description) {
        const severity = this.classifier.classify(category);
        const record = new SecurityAuditRecord(eventId, category, description, severity);
        this.collector.collect(record);
        return record;
    }
}
