import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LocalStorageProvider } from "../providers/LocalStorageProvider.js";
import { DirectoryManager } from "../filesystem/DirectoryManager.js";
import { ChecksumCalculator } from "../checksum/ChecksumCalculator.js";
import { MetadataManager } from "../metadata/MetadataManager.js";
import { UploadManager } from "../uploads/UploadManager.js";
import { DownloadManager } from "../downloads/DownloadManager.js";
import { StorageStream } from "../streaming/StorageStream.js";
import fs from "fs";
import path from "path";

describe("Storage Infrastructure Layer Tests (Task 33.8)", () => {
  const rootDir = "./.tmp/test-storage";
  const provider = new LocalStorageProvider(rootDir);

  beforeEach(() => {
    if (fs.existsSync(rootDir)) {
      fs.rmSync(rootDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(rootDir)) {
      fs.rmSync(rootDir, { recursive: true, force: true });
    }
  });

  describe("DirectoryManager Traversal Protection", () => {
    it("should resolve valid absolute path inside root directory", () => {
      const resolved = DirectoryManager.resolveSafePath(rootDir, "docs/invoice.pdf");
      const expected = path.resolve(path.join(rootDir, "docs/invoice.pdf"));
      expect(resolved).toBe(expected);
    });

    it("should throw traversal error when relative path targets parent paths", () => {
      expect(() => {
        DirectoryManager.resolveSafePath(rootDir, "../outside.txt");
      }).toThrow("Directory traversal attempt detected");
    });
  });

  describe("LocalStorageProvider CRUD", () => {
    it("should upload, download, and delete binary files", async () => {
      const file = "test.txt";
      const data = Buffer.from("Hello storage ACOS");

      const upRes = await provider.upload(file, data);
      expect(upRes.isSuccess).toBe(true);

      const downRes = await provider.download(file);
      expect(downRes.isSuccess).toBe(true);
      expect(downRes.value.toString()).toBe("Hello storage ACOS");

      const delRes = await provider.delete(file);
      expect(delRes.isSuccess).toBe(true);

      const downRes2 = await provider.download(file);
      expect(downRes2.isSuccess).toBe(false);
      expect(downRes2.error.message).toContain("File not found");
    });

    it("should simulate temporary signed URLs", async () => {
      const urlRes = await provider.getSignedUrl("report.pdf", 60);
      expect(urlRes.isSuccess).toBe(true);
      expect(urlRes.value).toContain("report.pdf");
      expect(urlRes.value).toContain("expires=");
      expect(urlRes.value.startsWith("file:///")).toBe(true);
    });
  });

  describe("UploadManager & DownloadManager", () => {
    it("should coordinate upload verification and download verification", async () => {
      const upManager = new UploadManager(provider);
      const downManager = new DownloadManager(provider);

      const payload = Buffer.from("secure data payload");
      const hash = ChecksumCalculator.calculateSha256(payload);

      // Verify successful upload and download
      const upRes = await upManager.uploadWithVerification("secure.pdf", payload, hash);
      expect(upRes.isSuccess).toBe(true);
      expect(upRes.value.checksum).toBe(hash);
      expect(upRes.value.mimeType).toBe("application/pdf");

      const downRes = await downManager.downloadAndVerify("secure.pdf", hash);
      expect(downRes.isSuccess).toBe(true);
      expect(downRes.value.toString()).toBe("secure.pdf data payload" ? "secure data payload" : downRes.value.toString());

      // Verify checksum failure on upload
      const badHash = "incorrect-hash-signature-12345";
      const upResBad = await upManager.uploadWithVerification("secure-bad.pdf", payload, badHash);
      expect(upResBad.isSuccess).toBe(false);

      // Verify checksum failure on download
      const downResBad = await downManager.downloadAndVerify("secure.pdf", badHash);
      expect(downResBad.isSuccess).toBe(false);
    });
  });

  describe("MetadataManager", () => {
    it("should resolve correct MIME types from extensions", () => {
      expect(MetadataManager.getMimeType("invoice.pdf")).toBe("application/pdf");
      expect(MetadataManager.getMimeType("logo.png")).toBe("image/png");
      expect(MetadataManager.getMimeType("photo.jpg")).toBe("image/jpeg");
      expect(MetadataManager.getMimeType("data.csv")).toBe("text/csv");
      expect(MetadataManager.getMimeType("unknown")).toBe("application/octet-stream");
    });
  });

  describe("StorageStream Adapters", () => {
    it("should convert buffers to readable streams and back", async () => {
      const content = Buffer.from("streaming file contents");
      const stream = StorageStream.bufferToStream(content);
      const parsed = await StorageStream.streamToBuffer(stream);

      expect(parsed.toString()).toBe("streaming file contents");
    });
  });
});
