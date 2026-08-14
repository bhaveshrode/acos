import { IStorageProvider } from "../../../foundation/contracts/provider/IStorageProvider.js";
import { ChecksumCalculator } from "../checksum/ChecksumCalculator.js";
import { MetadataManager, StorageMetadata } from "../metadata/MetadataManager.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

/**
 * High-level orchestration manager handling secure file writes and checksum verifications.
 */
export class UploadManager {
  constructor(private readonly provider: IStorageProvider) {}

  /**
   * Uploads file payload, confirming hash matches expected checksum rules, and generates metadata.
   */
  public async uploadWithVerification(
    filePath: string,
    content: Buffer,
    expectedHash?: string
  ): Promise<Result<StorageMetadata>> {
    const calculatedHash = ChecksumCalculator.calculateSha256(content);

    if (expectedHash && !ChecksumCalculator.verifySha256(content, expectedHash)) {
      return Result.fail(
        ResultError.validation("Checksum validation failed: File payload is corrupted.")
      );
    }

    const uploadResult = await this.provider.upload(filePath, content);
    if (!uploadResult.isSuccess) {
      return Result.fail(uploadResult.error);
    }

    const meta = MetadataManager.buildMetadata(filePath, content, calculatedHash);
    return Result.ok(meta);
  }
}
