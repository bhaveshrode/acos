/**
 * SupportManager handling customer support tickets.
 */
export class SupportManager {
  private readonly tickets = new Map<string, { id: string; title: string; status: "OPEN" | "RESOLVED" }>();

  public openCase(id: string, title: string): void {
    this.tickets.set(id.toLowerCase(), { id, title, status: "OPEN" });
  }

  public resolveCase(id: string): void {
    const ticket = this.tickets.get(id.toLowerCase());
    if (ticket) {
      ticket.status = "RESOLVED";
    }
  }

  public getCase(id: string): { id: string; title: string; status: "OPEN" | "RESOLVED" } | undefined {
    return this.tickets.get(id.toLowerCase());
  }

  public clear(): void {
    this.tickets.clear();
  }
}
