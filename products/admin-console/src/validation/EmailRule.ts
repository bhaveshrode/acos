import { PatternRule } from "./PatternRule.js";

/**
 * EmailRule checking validation of email formats.
 */
export class EmailRule extends PatternRule {
  constructor(message: string = "Invalid email format") {
    super(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message);
  }
}
