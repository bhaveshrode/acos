import path from "path";
import fs from "fs";

/**
 * File utility class handling path resolution, normalization, and path traversals.
 */
export class DirectoryManager {
  /**
   * Translates a relative logical path into an absolute physical path.
   * Throws an error if the path traverses outside the configured root directory.
   */
  public static resolveSafePath(root: string, logicalPath: string): string {
    const resolvedRoot = path.resolve(root);
    const resolvedPath = path.resolve(path.join(resolvedRoot, logicalPath));

    const relative = path.relative(resolvedRoot, resolvedPath);
    const isInside =
      relative && !relative.startsWith("..") && !path.isAbsolute(relative);

    if (!isInside && resolvedRoot !== resolvedPath) {
      throw new Error(`Directory traversal attempt detected: ${logicalPath}`);
    }

    return resolvedPath;
  }

  /**
   * Ensures that the parent directories of a physical file path are created.
   */
  public static ensureDirExistsForFile(filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}
