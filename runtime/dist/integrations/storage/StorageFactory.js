"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageFactory = void 0;
const GoogleDriveAdapter_js_1 = require("./GoogleDriveAdapter.js");
const DropboxAdapter_js_1 = require("./DropboxAdapter.js");
/**
 * StorageFactory constructing storage provider integrations.
 */
class StorageFactory {
    static createGoogleDriveAdapter() {
        return new GoogleDriveAdapter_js_1.GoogleDriveAdapter();
    }
    static createDropboxAdapter() {
        return new DropboxAdapter_js_1.DropboxAdapter();
    }
    createGoogleDriveAdapter() {
        return StorageFactory.createGoogleDriveAdapter();
    }
    createDropboxAdapter() {
        return StorageFactory.createDropboxAdapter();
    }
}
exports.StorageFactory = StorageFactory;
