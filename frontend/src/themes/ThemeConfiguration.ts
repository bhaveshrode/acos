import { ThemeTokens } from "./ThemeTokens.js";

/**
 * ThemeConfiguration wrapping immutable styling snapshots.
 */
export class ThemeConfiguration {
  constructor(public readonly tokens: ThemeTokens) {
    Object.freeze(this);
  }
}
