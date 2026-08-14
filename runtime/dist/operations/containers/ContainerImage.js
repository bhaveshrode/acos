"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerImage = void 0;
/**
 * ContainerImage representing cataloged image names and tags.
 */
class ContainerImage {
    name;
    tag;
    constructor(name, tag = "latest") {
        this.name = name;
        this.tag = tag;
        Object.freeze(this);
    }
}
exports.ContainerImage = ContainerImage;
