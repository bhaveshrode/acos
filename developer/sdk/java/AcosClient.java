package io.acos.sdk;

public class AcosClient {
    private String apiKey;
    private String baseUrl;

    private AcosClient(String apiKey, String baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    public static AcosClient init(String apiKey) {
        return new AcosClient(apiKey, "https://api.acos.io/v1");
    }
}
