/**
 * Enum representing the operational state of a Customer.
 */
export var CustomerStatus;
(function (CustomerStatus) {
    CustomerStatus["PROSPECT"] = "PROSPECT";
    CustomerStatus["ACTIVE"] = "ACTIVE";
    CustomerStatus["INACTIVE"] = "INACTIVE";
    CustomerStatus["BLOCKED"] = "BLOCKED";
    CustomerStatus["ARCHIVED"] = "ARCHIVED";
})(CustomerStatus || (CustomerStatus = {}));
