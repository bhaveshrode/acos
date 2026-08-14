"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndpointDescriptor = void 0;
/**
 * EndpointDescriptor mapping URL templates for ACOS endpoint services.
 */
class EndpointDescriptor {
    static Customer = {
        Get: (id) => `/customers/${id}`,
        Create: "/customers"
    };
    static Identity = {
        Register: "/users/register",
        Login: "/users/login"
    };
    static Organization = {
        Get: (id) => `/organizations/${id}`,
        AddMember: (id) => `/organizations/${id}/members`
    };
    static Invoice = {
        Get: (id) => `/invoices/${id}`,
        Issue: "/invoices"
    };
    static Payment = {
        Get: (id) => `/payments/${id}`,
        Process: "/payments"
    };
    static Settlement = {
        Get: (id) => `/settlements/${id}`,
        Initiate: "/settlements"
    };
    static AccountsReceivable = {
        Get: (id) => `/receivables/${id}`,
        WriteOff: (id) => `/receivables/${id}/write-off`
    };
    static Notification = {
        Get: (id) => `/notifications/${id}`,
        Send: "/notifications"
    };
    static Workflow = {
        Get: (id) => `/workflows/${id}`,
        TriggerAction: (id) => `/workflows/${id}/action`
    };
}
exports.EndpointDescriptor = EndpointDescriptor;
