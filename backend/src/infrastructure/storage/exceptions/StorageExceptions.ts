/**
 * Base storage exception.
 */
export class StorageException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageException";
  }
}

/**
 * Thrown when saving file payload content fails.
 */
export class UploadFailedException extends StorageException {
  constructor(filePath: string, details: string) {
    super(`Failed to upload file to '${filePath}': ${details}`);
    this.name = "UploadFailedException";
  }
}

/**
 * Thrown when reading file payload content fails.
 */
export class DownloadFailedException extends StorageException {
  constructor(filePath: string, details: string) {
    super(`Failed to download file from '${filePath}': ${details}`);
    this.name = "DownloadFailedException";
  }
}

/**
 * Thrown when a file path is missing or resolved path is empty.
 */
export class FileNotFoundException extends StorageException {
  constructor(filePath: string) {
    super(`File not found at path: ${filePath}`);
    this.name = "FileNotFoundException";
  }
}

/**
 * Thrown when file payload hashes do not match expected integrity signatures.
 */
export class ChecksumException extends StorageException {
  constructor(filePath: string, details: string) {
    super(`Checksum verification failed for '${filePath}': ${details}`);
    this.name = "ChecksumException";
  }
}
