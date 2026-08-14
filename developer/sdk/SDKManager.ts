import { AcosClient } from "./typescript/AcosClient.js";

export class SDKManager {
  public getLanguages(): string[] {
    return ["typescript", "javascript", "python", "java", "go", "dotnet"];
  }

  public getTypeScriptClient(apiKey: string): AcosClient {
    return AcosClient.init({ apiKey });
  }

  public getLanguageFilePath(language: string): string {
    const clean = language.trim().toLowerCase();
    switch (clean) {
      case "typescript": return "typescript/AcosClient.ts";
      case "javascript": return "javascript/AcosClient.js";
      case "python": return "python/acos_client.py";
      case "java": return "java/AcosClient.java";
      case "go": return "go/acos_client.go";
      case "dotnet": return "dotnet/AcosClient.cs";
      default:
        throw new Error(`Unsupported SDK language: ${language}`);
    }
  }
}
