/**
 * Enum representing the status of a User's membership inside an Organization.
 */
export var MemberStatus;
(function (MemberStatus) {
    MemberStatus["INVITED"] = "INVITED";
    MemberStatus["ACTIVE"] = "ACTIVE";
    MemberStatus["SUSPENDED"] = "SUSPENDED";
    MemberStatus["REMOVED"] = "REMOVED";
})(MemberStatus || (MemberStatus = {}));
