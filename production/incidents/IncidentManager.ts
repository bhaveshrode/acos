import { Incident } from "./Incident.js";

/**
 * IncidentManager tracking system failures and resolutions.
 */
export class IncidentManager {
  private readonly incidents = new Map<string, Incident>();

  public reportIncident(incident: Incident): void {
    this.incidents.set(incident.id.toLowerCase(), incident);
  }

  public resolveIncident(id: string): void {
    const inc = this.incidents.get(id.toLowerCase());
    if (inc) {
      inc.resolved = true;
    }
  }

  public getIncident(id: string): Incident | undefined {
    return this.incidents.get(id.toLowerCase());
  }

  public list(): Incident[] {
    return Array.from(this.incidents.values());
  }

  public clear(): void {
    this.incidents.clear();
  }
}
