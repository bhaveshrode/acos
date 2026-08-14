import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DocumentationManager {
  private getFilePath(filename: string): string {
    return path.join(__dirname, filename);
  }

  private readDocFile(filename: string, fallback: string): string {
    try {
      const p = this.getFilePath(filename);
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, "utf-8");
      }
    } catch {
      // Return fallback in case of dynamic resolution issues during testing
    }
    return fallback;
  }

  public getApiDoc(): string {
    return this.readDocFile("api.md", "# ACOS Core API Reference\nFallback document.");
  }

  public getArchitectureDoc(): string {
    return this.readDocFile("architecture.md", "# ACOS System Architecture\nFallback document.");
  }

  public getSdkDoc(): string {
    return this.readDocFile("sdk.md", "# ACOS Client SDKs Reference\nFallback document.");
  }

  public getTutorials(): string[] {
    const raw = this.readDocFile("tutorials.md", "Tutorial 1: Quickstart Authentication\nTutorial 2: Creating an Invoice");
    return raw.split("\n").filter(line => line.startsWith("##") || line.startsWith("Tutorial"));
  }

  public getExamplesDoc(): string {
    return this.readDocFile("examples.md", "# ACOS Integration Examples\nFallback document.");
  }
}
