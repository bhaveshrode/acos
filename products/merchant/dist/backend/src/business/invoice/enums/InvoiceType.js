/**
 * Enum representing the billing classification of an Invoice.
 */
export var InvoiceType;
(function (InvoiceType) {
    InvoiceType["STANDARD"] = "STANDARD";
    InvoiceType["RECURRING"] = "RECURRING";
    InvoiceType["PROFORMA"] = "PROFORMA";
    InvoiceType["CREDIT"] = "CREDIT";
})(InvoiceType || (InvoiceType = {}));
