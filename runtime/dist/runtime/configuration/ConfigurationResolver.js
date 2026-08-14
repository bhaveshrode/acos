import { RuntimeConfiguration } from "./RuntimeConfiguration.js";
import { EnvironmentProfile } from "./EnvironmentProfile.js";
import { ConfigurationValidator } from "./ConfigurationValidator.js";
/**
 * ConfigurationResolver loading profile snaps.
 */
export class ConfigurationResolver {
    validator = new ConfigurationValidator();
    resolve(env, overrides = {}) {
        const profile = this.parseProfile(env);
        // Profile defaults
        let dbUrl = "mock://localhost:5432/acos_dev";
        let apiUrl = "http://localhost:3000";
        let wsUrl = "ws://localhost:3005";
        let payment = "stripe";
        let blockchain = "circle";
        if (profile === EnvironmentProfile.Production) {
            dbUrl = "postgresql://postgres:secret@database:5432/acos_prod";
            apiUrl = "https://api.acos.com";
            wsUrl = "wss://ws.acos.com";
        }
        const config = new RuntimeConfiguration(profile, overrides.databaseUrl ?? dbUrl, overrides.apiUrl ?? apiUrl, overrides.websocketUrl ?? wsUrl, overrides.paymentProvider ?? payment, overrides.blockchainProvider ?? blockchain);
        this.validator.validate(config);
        return config;
    }
    parseProfile(env) {
        switch (env?.toLowerCase()) {
            case "production":
            case "prod":
                return EnvironmentProfile.Production;
            case "staging":
            case "stage":
                return EnvironmentProfile.Staging;
            case "testing":
            case "test":
                return EnvironmentProfile.Testing;
            default:
                return EnvironmentProfile.Development;
        }
    }
}
