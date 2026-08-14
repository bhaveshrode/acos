/**
 * Enum representing the operational state of an Organization.
 */
export var OrganizationStatus;
(function (OrganizationStatus) {
    OrganizationStatus["PENDING"] = "PENDING";
    OrganizationStatus["ACTIVE"] = "ACTIVE";
    OrganizationStatus["SUSPENDED"] = "SUSPENDED";
    OrganizationStatus["ARCHIVED"] = "ARCHIVED";
    OrganizationStatus["DELETED"] = "DELETED";
})(OrganizationStatus || (OrganizationStatus = {}));
