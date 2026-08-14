import path from "path";

export interface StorageMetadata {
  fileName: string;
  size: number;
  mimeType: string;
  checksum: string;
  timestamp: Date;
}

/**
 * Metadata extractor evaluating file sizes, content types, and timestamps.
 */
export class MetadataManager {
  /**
   * Resolves common internet media MIME type extensions.
   */
  public static getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case ".pdf":
        return "application/pdf";
      case ".png":
        return "image/png";
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".json":
        return "application/json";
      case ".txt":
        return "text/plain";
      case ".csv":
        return "text/csv";
      case ".xml":
        return "application/xml";
      default:
        return "application/octet-stream";
    }
  }

  /**
   * Builds an immutable StorageMetadata record wrapper.
   */
  public static buildMetadata(
    fileName: string,
    content: Buffer,
    hash: string
  ): StorageMetadata {
    return {
      fileName: path.basename(fileName),
      size: content.length,
      mimeType: this.getMimeType(fileName),
      checksum: hash,
      timestamp: new Date()
    };
  }
}
