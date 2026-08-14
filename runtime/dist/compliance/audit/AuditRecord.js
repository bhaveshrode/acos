/**
 * AuditRecord documenting a transaction, command, or security action.
 */
export class AuditRecord {
    actorId;
    actorType;
    tenantId;
    action;
    resource;
    eventId;
    correlationId;
    causationId;
    policy;
    authorization;
    result;
    timestamp;
    signature;
    constructor(actorId, actorType, tenantId, action, resource, eventId, correlationId, causationId, policy, authorization, result, timestamp = new Date(), signature) {
        this.actorId = actorId;
        this.actorType = actorType;
        this.tenantId = tenantId;
        this.action = action;
        this.resource = resource;
        this.eventId = eventId;
        this.correlationId = correlationId;
        this.causationId = causationId;
        this.policy = policy;
        this.authorization = authorization;
        this.result = result;
        this.timestamp = timestamp;
        this.signature = signature;
        Object.freeze(this);
    }
}
