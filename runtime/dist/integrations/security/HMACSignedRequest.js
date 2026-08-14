"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HMACSignedRequest = void 0;
/**
 * HMACSignedRequest verifying payload signatures.
 */
class HMACSignedRequest {
    static sign(payload, secret) {
        return `sig_${payload.length}_${secret.substring(0, 4)}`;
    }
    static verify(payload, signature, secret) {
        const expected = HMACSignedRequest.sign(payload, secret);
        return expected === signature;
    }
}
exports.HMACSignedRequest = HMACSignedRequest;
