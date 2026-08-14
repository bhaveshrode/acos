export interface TenantResource {
  organizationId: string;
}

export class TenantContext {
  constructor(public readonly organizationId: string) {
    Object.freeze(this);
  }

  public enforceIsolation(resource: TenantResource): void {
    if (resource.organizationId !== this.organizationId) {
      throw new Error(
        `Multi-Tenant Isolation Breach: Tenant '${this.organizationId}' attempted to access resource belonging to Tenant '${resource.organizationId}'.`
      );
    }
  }
}
