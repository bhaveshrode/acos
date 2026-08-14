class AcosClient:
    def __init__(self, api_key: str, base_url: str = "https://api.acos.io/v1"):
        self.api_key = api_key
        self.base_url = base_url

    @staticmethod
    def init(api_key: str, base_url: str = "https://api.acos.io/v1"):
        return AcosClient(api_key, base_url)
