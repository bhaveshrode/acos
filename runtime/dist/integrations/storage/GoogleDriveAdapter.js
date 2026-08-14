"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveAdapter = void 0;
/**
 * GoogleDriveAdapter adapting external Google Drive storage APIs.
 */
class GoogleDriveAdapter {
    async uploadFile(path, content) {
        return `gdrive_file_id_${path}`;
    }
    async downloadFile(fileId) {
        return `gdrive_content_for_${fileId}`;
    }
}
exports.GoogleDriveAdapter = GoogleDriveAdapter;
