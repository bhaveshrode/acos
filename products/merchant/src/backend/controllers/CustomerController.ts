import { BaseController } from "./BaseController.js";

export class CustomerController extends BaseController {
  public async handle(
    method: string,
    path: string,
    payload?: any,
    headers?: Record<string, string>
  ): Promise<{ status: number; body: any } | null> {
    if (method === "POST" && path === "/business/customers") {
      const token = this.extractBearerToken(headers);
      if (!token) {
        return {
          status: 401,
          body: { error: "Unauthorized: Missing session token." }
        };
      }

      let userProfile;
      try {
        userProfile = await this.acosBoundary.me(token);
      } catch (err: any) {
        return {
          status: 401,
          body: { error: "Unauthorized", message: err.message }
        };
      }

      const business = await this.acosBoundary.getBusinessForUser(userProfile.id);
      if (!business) {
        return {
          status: 400,
          body: { error: "Bad Request: Business onboarding required before managing customers." }
        };
      }

      if (!payload || !payload.name || !payload.customerNumber || !payload.primaryContact || !payload.billingAddress) {
        return {
          status: 400,
          body: { error: "Bad Request: name, customerNumber, primaryContact, and billingAddress are required." }
        };
      }

      try {
        const dto = {
          ...payload,
          organizationId: business.id
        };

        const customer = await this.acosBoundary.createCustomer(userProfile.id, dto);
        return {
          status: 201,
          body: customer
        };
      } catch (err: any) {
        this.logger.warn("Customer registration rejected", { error: err.message });
        return {
          status: 400,
          body: { error: "Customer Creation Failed", message: err.message }
        };
      }
    }

    if (method === "GET" && path === "/business/customers") {
      const token = this.extractBearerToken(headers);
      if (!token) {
        return {
          status: 401,
          body: { error: "Unauthorized: Missing session token." }
        };
      }

      let userProfile;
      try {
        userProfile = await this.acosBoundary.me(token);
      } catch (err: any) {
        return {
          status: 401,
          body: { error: "Unauthorized", message: err.message }
        };
      }

      const business = await this.acosBoundary.getBusinessForUser(userProfile.id);
      if (!business) {
        return {
          status: 400,
          body: { error: "Bad Request: Business onboarding required." }
        };
      }

      try {
        const list = await this.acosBoundary.getCustomers(userProfile.id, business.id);
        return {
          status: 200,
          body: list
        };
      } catch (err: any) {
        return {
          status: 400,
          body: { error: "Fetch Customers Failed", message: err.message }
        };
      }
    }

    if (method === "GET" && path.startsWith("/business/customers/") && path.endsWith("/credit-balance")) {
      const token = this.extractBearerToken(headers);
      if (!token) {
        return {
          status: 401,
          body: { error: "Unauthorized: Missing session token." }
        };
      }

      let userProfile;
      try {
        userProfile = await this.acosBoundary.me(token);
      } catch (err: any) {
        return {
          status: 401,
          body: { error: "Unauthorized", message: err.message }
        };
      }

      const customerId = path.substring("/business/customers/".length, path.length - "/credit-balance".length);
      if (!customerId || customerId.trim() === "") {
        return {
          status: 400,
          body: { error: "Bad Request: Customer ID is required." }
        };
      }

      try {
        const balance = await this.acosBoundary.getCustomerCreditBalance(userProfile.id, customerId);
        return {
          status: 200,
          body: balance
        };
      } catch (err: any) {
        this.logger.warn("Fetch customer credit balance rejected", { customerId, error: err.message });

        const isAccessDenied = err.message.includes("Access Denied");
        const isNotFound = err.message.includes("not found");
        return {
          status: isAccessDenied ? 403 : (isNotFound ? 404 : 400),
          body: { error: isAccessDenied ? "Forbidden" : "Credit Balance Fetch Failed", message: err.message }
        };
      }
    }

    if (method === "GET" && path.startsWith("/business/customers/")) {
      const token = this.extractBearerToken(headers);
      if (!token) {
        return {
          status: 401,
          body: { error: "Unauthorized: Missing session token." }
        };
      }

      let userProfile;
      try {
        userProfile = await this.acosBoundary.me(token);
      } catch (err: any) {
        return {
          status: 401,
          body: { error: "Unauthorized", message: err.message }
        };
      }

      const customerId = path.substring("/business/customers/".length);
      if (!customerId || customerId.trim() === "") {
        return {
          status: 400,
          body: { error: "Bad Request: Customer ID is required." }
        };
      }

      try {
        const customer = await this.acosBoundary.getCustomerById(userProfile.id, customerId);
        return {
          status: 200,
          body: customer
        };
      } catch (err: any) {
        this.logger.warn("Fetch customer by ID rejected", { customerId, error: err.message });
        
        const isAccessDenied = err.message.includes("Access Denied");
        return {
          status: isAccessDenied ? 403 : 404,
          body: { error: isAccessDenied ? "Forbidden" : "Not Found", message: err.message }
        };
      }
    }

    return null;
  }
}
