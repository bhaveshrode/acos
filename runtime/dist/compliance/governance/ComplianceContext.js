/**
 * ComplianceContext capturing the identity and correlation trail of a requested action.
 */
export class ComplianceContext {
    actorId;
    actorType;
    tenantId;
    action;
    resource;
    correlationId;
    causationId;
    constructor(actorId, actorType, tenantId, action, resource, correlationId, causationId) {
        this.actorId = actorId;
        this.actorType = actorType;
        this.tenantId = tenantId;
        this.action = action;
        this.resource = resource;
        this.correlationId = correlationId;
        this.causationId = causationId;
        Object.freeze(this);
    }
}
