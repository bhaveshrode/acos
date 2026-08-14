import { IStorageProvider } from "../../../foundation/contracts/provider/IStorageProvider.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";
import { DirectoryManager } from "../filesystem/DirectoryManager.js";
import fs from "fs";

/**
 * Concrete storage provider reading, writing, and deleting files on the local disk drive.
 */
export class LocalStorageProvider implements IStorageProvider {
  constructor(private readonly storageRoot: string) {}

  /**
   * Persists the binary buffer contents to the target path.
   */
  public async upload(filePath: string, content: Buffer): Promise<Result<void>> {
    try {
      const physicalPath = DirectoryManager.resolveSafePath(this.storageRoot, filePath);
      DirectoryManager.ensureDirExistsForFile(physicalPath);
      fs.writeFileSync(physicalPath, content);
      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message || "Failed to write file."));
    }
  }

  /**
   * Reads and retrieves the binary buffer content of a file.
   */
  public async download(filePath: string): Promise<Result<Buffer>> {
    try {
      const physicalPath = DirectoryManager.resolveSafePath(this.storageRoot, filePath);
      if (!fs.existsSync(physicalPath)) {
        return Result.fail(ResultError.notFound(`File not found: ${filePath}`));
      }
      const content = fs.readFileSync(physicalPath);
      return Result.ok(content);
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message || "Failed to read file."));
    }
  }

  /**
   * Removes a file from disk if it exists.
   */
  public async delete(filePath: string): Promise<Result<void>> {
    try {
      const physicalPath = DirectoryManager.resolveSafePath(this.storageRoot, filePath);
      if (fs.existsSync(physicalPath)) {
        fs.unlinkSync(physicalPath);
      }
      return Result.ok();
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message || "Failed to delete file."));
    }
  }

  /**
   * Generates a simulated pre-signed URL for direct browser access.
   */
  public async getSignedUrl(filePath: string, expiresInSeconds: number): Promise<Result<string>> {
    try {
      const physicalPath = DirectoryManager.resolveSafePath(this.storageRoot, filePath);
      const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
      const url = `file:///${physicalPath.replace(/\\/g, "/")}?expires=${expires}`;
      return Result.ok(url);
    } catch (err: any) {
      return Result.fail(ResultError.unexpected(err.message || "Failed to generate signed URL."));
    }
  }
}
