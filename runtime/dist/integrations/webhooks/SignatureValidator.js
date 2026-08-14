"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignatureValidator = void 0;
const HMACSignedRequest_js_1 = require("../security/HMACSignedRequest.js");
/**
 * SignatureValidator validating signatures against registered secrets.
 */
class SignatureValidator {
    validate(payload, signature, secret) {
        return HMACSignedRequest_js_1.HMACSignedRequest.verify(payload, signature, secret);
    }
}
exports.SignatureValidator = SignatureValidator;
