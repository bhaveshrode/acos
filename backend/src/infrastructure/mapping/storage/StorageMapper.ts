import { MapperBase } from "../common/MapperBase.js";

export interface RawUploadResult {
  fileKey: string;
  byteLength: number;
  sha256Hash: string;
}

export interface FileMetadata {
  fileName: string;
  size: number;
  checksum: string;
}

/**
 * Mapper transforming raw upload response parameters into standard file metadata cards.
 */
export class StorageMapper extends MapperBase<RawUploadResult, FileMetadata> {
  public map(source: RawUploadResult): FileMetadata {
    return {
      fileName: source.fileKey,
      size: source.byteLength,
      checksum: source.sha256Hash
    };
  }
}
