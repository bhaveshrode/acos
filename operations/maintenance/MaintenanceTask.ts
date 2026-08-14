/**
 * MaintenanceTask defining standard executing runs.
 */
export interface MaintenanceTask {
  id: string;
  execute(): Promise<boolean>;
}
