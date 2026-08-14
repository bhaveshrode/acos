import { BaseDomainEvent } from "../../../foundation/events/DomainEvent.js";
import { OrganizationSettings } from "../value-objects/OrganizationSettings.js";

/**
 * Domain event emitted when organization preferences or defaults are modified.
 */
export class OrganizationSettingsChanged extends BaseDomainEvent {
  public readonly settings: OrganizationSettings;

  constructor(organizationId: string, settings: OrganizationSettings) {
    super(organizationId, "Organization");
    this.settings = settings;
  }
}
