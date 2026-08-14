/**
 * EndpointDescriptor mapping URL templates for ACOS endpoint services.
 */
export class EndpointDescriptor {
  public static readonly Customer = {
    Get: (id: string) => `/customers/${id}`,
    Create: "/customers"
  };

  public static readonly Identity = {
    Register: "/users/register",
    Login: "/users/login"
  };

  public static readonly Organization = {
    Get: (id: string) => `/organizations/${id}`,
    AddMember: (id: string) => `/organizations/${id}/members`
  };

  public static readonly Invoice = {
    Get: (id: string) => `/invoices/${id}`,
    Issue: "/invoices"
  };

  public static readonly Payment = {
    Get: (id: string) => `/payments/${id}`,
    Process: "/payments"
  };

  public static readonly Settlement = {
    Get: (id: string) => `/settlements/${id}`,
    Initiate: "/settlements"
  };

  public static readonly AccountsReceivable = {
    Get: (id: string) => `/receivables/${id}`,
    WriteOff: (id: string) => `/receivables/${id}/write-off`
  };

  public static readonly Notification = {
    Get: (id: string) => `/notifications/${id}`,
    Send: "/notifications"
  };

  public static readonly Workflow = {
    Get: (id: string) => `/workflows/${id}`,
    TriggerAction: (id: string) => `/workflows/${id}/action`
  };
}
