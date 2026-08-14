/**
 * Enum representing origins of unapplied customer credits.
 */
export var CreditSource;
(function (CreditSource) {
    CreditSource["OVERPAYMENT"] = "OVERPAYMENT";
    CreditSource["REFUND"] = "REFUND";
    CreditSource["ADJUSTMENT"] = "ADJUSTMENT";
    CreditSource["MANUAL"] = "MANUAL";
})(CreditSource || (CreditSource = {}));
