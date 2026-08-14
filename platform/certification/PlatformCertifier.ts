export interface CertificationItem {
  id: string;
  area: string;
  requirement: string;
  status: "PASSED" | "FAILED" | "PENDING";
}

export class PlatformCertifier {
  private readonly items: CertificationItem[] = [];

  constructor() {
    this.register("R01", "Real database", "Validate commits, rollbacks, and unique constraint checks");
    this.register("R02", "Real API", "Verify REST routing, error schemas, and validation responses");
    this.register("R03", "Real frontend", "WebSocket broadcast updates frontend component states");
    this.register("R04", "Real authentication", "Verify tokens validation and expiration checks");
    this.register("R05", "Real authorization", "Agent tools execution scoped to user claims");
    this.register("R06", "Real integrations", "Interact with payment adapters and simulated Stripe sandboxes");
    this.register("R07", "Real webhooks", "Enforce signature check validations and webhook replays");
    this.register("R08", "Real persistence", "Verify database connection pooling and transaction rollbacks");
    this.register("R09", "Real commerce workflow", "Run E2E Invoice issued -> paid -> settled journeys");
    this.register("R10", "Real autonomous workflow", "Agent plan execution resumes post manual approval");
    this.register("R11", "Failure recovery", "Verify retry loops and circuit breaker open fallbacks");
    this.register("R12", "Concurrency", "Stress-test concurrent requests pay limits on single resources");
    this.register("R13", "Security", "Blocks revoked sessions, privilege escalations, and cross-tenants");
    this.register("R14", "Observability", "Trace event causation chains across distributed transactions");
    this.register("R15", "Deployment", "Validate container config structures and schema migration pings");
  }

  public register(id: string, area: string, requirement: string): void {
    this.items.push({ id, area, requirement, status: "PENDING" });
  }

  public certify(id: string, passed: boolean): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.status = passed ? "PASSED" : "FAILED";
    }
  }

  public getMatrix(): readonly CertificationItem[] {
    return Object.freeze([...this.items]);
  }

  public printReport(): string {
    const header = "| ID  | Area                     | Requirement                                      | Status   |";
    const divider = "|-----|--------------------------|--------------------------------------------------|----------|";
    const rows = this.items.map((i) => {
      const statusPadding = i.status === "PASSED" ? "🟢 PASSED" : i.status === "FAILED" ? "🔴 FAILED" : "🟡 PENDING";
      return `| ${i.id.padEnd(3)} | ${i.area.padEnd(24)} | ${i.requirement.padEnd(48)} | ${statusPadding.padEnd(8)} |`;
    });

    return [
      "\n==========================================================================",
      "                 ACOS RUNTIME PRODUCTION CERTIFICATION MATRIX            ",
      "==========================================================================",
      header,
      divider,
      ...rows,
      "==========================================================================\n"
    ].join("\n");
  }
}
