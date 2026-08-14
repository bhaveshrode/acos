import { IStorageProvider } from "../../../foundation/contracts/provider/IStorageProvider.js";
import { ChecksumCalculator } from "../checksum/ChecksumCalculator.js";
import { Result } from "../../../foundation/result/Result.js";
import { ResultError } from "../../../foundation/result/ResultError.js";

/**
 * High-level orchestration manager handling secure file downloads and checksum verifications.
 */
export class DownloadManager {
  constructor(private readonly provider: IStorageProvider) {}

  /**
   * Downloads target file, verifying it matches expected integrity signatures.
   */
  public async downloadAndVerify(
    filePath: string,
    expectedHash?: string
  ): Promise<Result<Buffer>> {
    const downloadResult = await this.provider.download(filePath);
    if (!downloadResult.isSuccess) {
      return Result.fail(downloadResult.error);
    }

    const buffer = downloadResult.value;
    if (expectedHash && !ChecksumCalculator.verifySha256(buffer, expectedHash)) {
      return Result.fail(
        ResultError.validation("Checksum validation failed: File payload corrupted during download.")
      );
    }

    return Result.ok(buffer);
  }
}
