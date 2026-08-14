export class OAuthPlayground {
  public generateAuthUrl(clientId: string, redirectUri: string, scope: string): string {
    const encodedRedirect = encodeURIComponent(redirectUri);
    const encodedScope = encodeURIComponent(scope);
    return `https://auth.acos.io/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirect}&scope=${encodedScope}&state=acos_playground_state`;
  }

  public async exchangeCodeForToken(
    code: string,
    clientId: string,
    clientSecret: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    if (!code || code !== "acos_mock_code_123") {
      throw new Error("Invalid authorization code.");
    }
    if (!clientId || !clientSecret) {
      throw new Error("Missing client_id or client_secret.");
    }

    return {
      accessToken: "acos_access_token_abc123xyz",
      refreshToken: "acos_refresh_token_789qwe",
      expiresIn: 3600
    };
  }

  public async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; expiresIn: number }> {
    if (!refreshToken || refreshToken !== "acos_refresh_token_789qwe") {
      throw new Error("Invalid refresh token.");
    }

    return {
      accessToken: "acos_access_token_new_abc123xyz",
      expiresIn: 3600
    };
  }
}
