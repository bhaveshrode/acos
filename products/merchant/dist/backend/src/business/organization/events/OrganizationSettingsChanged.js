import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
/**
 * Domain event emitted when organization preferences or defaults are modified.
 */
export class OrganizationSettingsChanged extends BaseDomainEvent {
    settings;
    constructor(organizationId, settings) {
        super(organizationId, "Organization");
        this.settings = settings;
    }
}
