import { ContextBuilder } from "../context/ContextBuilder.js";

export class ContextFactory {
  public createContextBuilder(): ContextBuilder {
    return new ContextBuilder();
  }
}
