/**
 * Enum representing the lifecycle status of an authentication Session.
 */
export var SessionStatus;
(function (SessionStatus) {
    SessionStatus["ACTIVE"] = "ACTIVE";
    SessionStatus["EXPIRED"] = "EXPIRED";
    SessionStatus["REVOKED"] = "REVOKED";
})(SessionStatus || (SessionStatus = {}));
