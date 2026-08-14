import { AcosCLI } from "../cli/AcosCLI.js";

export class CLIFactory {
  public createCLI(): AcosCLI {
    return new AcosCLI();
  }
}
