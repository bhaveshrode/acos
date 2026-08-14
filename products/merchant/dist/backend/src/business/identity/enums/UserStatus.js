/**
 * Enum representing the account status lifecycle of a User.
 */
export var UserStatus;
(function (UserStatus) {
    UserStatus["PENDING_VERIFICATION"] = "PENDING_VERIFICATION";
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
    UserStatus["DISABLED"] = "DISABLED";
    UserStatus["DELETED"] = "DELETED";
})(UserStatus || (UserStatus = {}));
