import { AssignmentReference } from "../value-objects/AssignmentReference.js";

/**
 * Domain Service enforcing assignment routing and selection rules (e.g. round-robin).
 */
export class TaskAssignmentPolicy {
  /**
   * Selects next assignee from candidate array using a round-robin index.
   */
  public selectNextAssigneeRoundRobin(
    candidates: AssignmentReference[],
    lastAssigneeIndex: number
  ): { assignee: AssignmentReference; nextIndex: number } {
    if (candidates.length === 0) {
      throw new Error("Candidates list cannot be empty.");
    }
    const nextIndex = (lastAssigneeIndex + 1) % candidates.length;
    return {
      assignee: candidates[nextIndex],
      nextIndex
    };
  }
}
