import { EnvironmentProfile } from "./EnvironmentProfile.js";
/**
 * RuntimeConfiguration capturing environment details.
 */
export class RuntimeConfiguration {
    env;
    databaseUrl;
    apiUrl;
    websocketUrl;
    paymentProvider;
    blockchainProvider;
    isProduction;
    constructor(env, databaseUrl, apiUrl, websocketUrl, paymentProvider, blockchainProvider, isProduction = env === EnvironmentProfile.Production) {
        this.env = env;
        this.databaseUrl = databaseUrl;
        this.apiUrl = apiUrl;
        this.websocketUrl = websocketUrl;
        this.paymentProvider = paymentProvider;
        this.blockchainProvider = blockchainProvider;
        this.isProduction = isProduction;
        Object.freeze(this);
    }
}
