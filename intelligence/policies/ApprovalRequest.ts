export interface ApprovalRequest {
  id: string;
  decisionId: string;
  planId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}
