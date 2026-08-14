/**
 * Enum representing supported payment mechanism types.
 */
export var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["USDC"] = "USDC";
    PaymentMethodType["USDT"] = "USDT";
    PaymentMethodType["WIRE"] = "WIRE";
    PaymentMethodType["ACH"] = "ACH";
    PaymentMethodType["CARD"] = "CARD";
    PaymentMethodType["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethodType["STRIPE"] = "STRIPE";
})(PaymentMethodType || (PaymentMethodType = {}));
