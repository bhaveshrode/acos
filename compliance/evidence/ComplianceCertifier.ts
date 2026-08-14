export interface ComplianceRequirementStatus {
  id: string;
  area: string;
  requirement: string;
  status: "PASSED" | "FAILED" | "PENDING";
}

/**
 * ComplianceCertifier verifying the G01-G18 compliance rules.
 */
export class ComplianceCertifier {
  private readonly items: ComplianceRequirementStatus[] = [];

  constructor() {
    this.register("G01", "Audit", "Audit records are immutable");
    this.register("G02", "Actors", "Human/agent/system actors are identifiable");
    this.register("G03", "Tenancy", "Audit records contain tenant attribution");
    this.register("G04", "Correlation", "Event/correlation/causation IDs are preserved");
    this.register("G05", "Authorization", "Authorization decisions are auditable");
    this.register("G06", "Agent Governance", "Agent actions are attributable");
    this.register("G07", "Approval", "Human approval decisions are auditable");
    this.register("G08", "Privacy", "Personal data is classified");
    this.register("G09", "Retention", "Retention policies are enforced");
    this.register("G10", "Erasure", "Erasure requests are processed safely");
    this.register("G11", "Legal Hold", "Protected records cannot be prematurely erased");
    this.register("G12", "PCI", "Sensitive payment data boundaries are enforced");
    this.register("G13", "Masking", "Sensitive fields are masked");
    this.register("G14", "Tax", "Tax transactions can produce reports");
    this.register("G15", "Security", "Security events are auditable");
    this.register("G16", "Evidence", "Compliance evidence can be generated");
    this.register("G17", "Query", "Authorized audit investigation is supported");
    this.register("G18", "Governance", "Compliance violations produce explicit decisions");
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

  public getMatrix(): readonly ComplianceRequirementStatus[] {
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
      "                 ACOS COMPLIANCE & GOVERNANCE CERTIFICATION MATRIX        ",
      "==========================================================================",
      header,
      divider,
      ...rows,
      "==========================================================================\n"
    ].join("\n");
  }
}
