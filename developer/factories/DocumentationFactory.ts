import { DocumentationManager } from "../documentation/DocumentationManager.js";

export class DocumentationFactory {
  public createManager(): DocumentationManager {
    return new DocumentationManager();
  }
}
