"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDeserializer = void 0;
const Email_js_1 = require("../../../business/identity/value-objects/Email.js");
const PasswordHash_js_1 = require("../../../business/identity/value-objects/PasswordHash.js");
const VerificationToken_js_1 = require("../../../business/identity/value-objects/VerificationToken.js");
const PasswordResetToken_js_1 = require("../../../business/identity/value-objects/PasswordResetToken.js");
const LoginAttempt_js_1 = require("../../../business/identity/value-objects/LoginAttempt.js");
const SessionId_js_1 = require("../../../business/identity/value-objects/SessionId.js");
const RefreshToken_js_1 = require("../../../business/identity/value-objects/RefreshToken.js");
const Identifier_js_1 = require("../../../foundation/core/Identifier.js");
/**
 * Reconstructs UserProps domain structure from UserSnapshot persistence models.
 */
class UserDeserializer {
    static deserialize(snapshot) {
        const sessions = new Map();
        for (const sess of snapshot.sessions) {
            sessions.set(sess.sessionId, {
                sessionId: new SessionId_js_1.SessionId(new Identifier_js_1.UniqueEntityID(sess.sessionId)),
                refreshToken: RefreshToken_js_1.RefreshToken.create(sess.refreshToken).value,
                expiresAt: sess.expiresAt,
                status: sess.status
            });
        }
        const loginAttempts = snapshot.loginAttempts.map((att) => LoginAttempt_js_1.LoginAttempt.create(att.timestamp, att.ipAddress, att.successful).value);
        return {
            email: Email_js_1.Email.create(snapshot.email).value,
            passwordHash: PasswordHash_js_1.PasswordHash.create(snapshot.passwordHash).value,
            status: snapshot.status,
            name: snapshot.name,
            verificationToken: snapshot.verificationToken
                ? VerificationToken_js_1.VerificationToken.create(snapshot.verificationToken.token, snapshot.verificationToken.expiresAt).value
                : null,
            passwordResetToken: snapshot.passwordResetToken
                ? PasswordResetToken_js_1.PasswordResetToken.create(snapshot.passwordResetToken.token, snapshot.passwordResetToken.expiresAt).value
                : null,
            loginAttempts,
            sessions,
            createdAt: snapshot.createdAt,
            updatedAt: snapshot.updatedAt
        };
    }
}
exports.UserDeserializer = UserDeserializer;
