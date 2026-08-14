namespace Acos.Sdk
{
    public class AcosClient
    {
        public string ApiKey { get; }
        public string BaseUrl { get; }

        private AcosClient(string apiKey, string baseUrl)
        {
            ApiKey = apiKey;
            BaseUrl = baseUrl;
        }

        public static AcosClient Init(string apiKey)
        {
            return new AcosClient(apiKey, "https://api.acos.io/v1");
        }
    }
}
