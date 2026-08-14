package sdk

type AcosClient struct {
	ApiKey  string
	BaseUrl string
}

func Init(apiKey string) *AcosClient {
	return &AcosClient{
		ApiKey:  apiKey,
		BaseUrl: "https://api.acos.io/v1",
	}
}
