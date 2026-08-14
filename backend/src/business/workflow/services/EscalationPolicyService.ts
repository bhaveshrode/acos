import { EscalationLevel } from "../enums/EscalationLevel.js";
import { EscalationPolicy } from "../value-objects/EscalationPolicy.js";

/**
 * Domain Service checking task deadline offsets to determine appropriate EscalationLevel.
 */
export class EscalationPolicyService {
  /**
   * Evaluates duration elapsed since task dueDate and resolves the target EscalationLevel.
   */
  public determineEscalationLevel(
    dueDate: Date,
    currentTime: Date,
    policy: EscalationPolicy
  ): EscalationLevel {
    const elapsedSeconds = (currentTime.getTime() - dueDate.getTime()) / 1000;
    if (elapsedSeconds <= 0) return EscalationLevel.NONE;

    if (elapsedSeconds >= policy.level3) {
      return EscalationLevel.LEVEL3;
    }
    if (elapsedSeconds >= policy.level2) {
      return EscalationLevel.LEVEL2;
    }
    if (elapsedSeconds >= policy.level1) {
      return EscalationLevel.LEVEL1;
    }
    return EscalationLevel.NONE;
  }
}
