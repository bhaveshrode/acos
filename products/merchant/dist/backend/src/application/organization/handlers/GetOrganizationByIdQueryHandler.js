import { ApplicationResult } from "../../foundation/results/ApplicationResult.js";
import { OrganizationId } from "../../../business/organization/value-objects/OrganizationId.js";
/**
 * Use case handler reading an Organization by ID.
 */
export class GetOrganizationByIdQueryHandler {
    repository;
    mapper;
    constructor(repository, mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
    async handle(request) {
        const orgId = OrganizationId.from(request.id);
        const loadRes = await this.repository.findById(orgId);
        if (loadRes.isFailure) {
            return ApplicationResult.failure(loadRes.error.message);
        }
        return ApplicationResult.success(this.mapper.map(loadRes.value));
    }
}
