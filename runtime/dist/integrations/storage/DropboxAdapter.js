"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropboxAdapter = void 0;
/**
 * DropboxAdapter adapting external Dropbox storage APIs.
 */
class DropboxAdapter {
    async uploadFile(path, content) {
        return `dropbox_file_id_${path}`;
    }
    async downloadFile(fileId) {
        return `dropbox_content_for_${fileId}`;
    }
}
exports.DropboxAdapter = DropboxAdapter;
