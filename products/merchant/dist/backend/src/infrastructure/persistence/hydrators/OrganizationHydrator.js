import { Organization } from "../../../business/organization/aggregates/Organization.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
import { OrganizationDeserializer } from "../deserializers/OrganizationDeserializer.js";
/**
 * Reconstructs the complete Organization aggregate root from historical snapshot state.
 */
export class OrganizationHydrator {
    static hydrate(snapshot) {
        const props = OrganizationDeserializer.deserialize(snapshot);
        const id = new OrganizationId(snapshot.id);
        return new Organization(id, props);
    }
}
