/**
 * RefreshTokenProvider generating key strings for token lifecycle refreshes.
 */
export class RefreshTokenProvider {
  public generateRefreshToken(): string {
    return `ref-${Math.random().toString(36).substring(2, 15)}`;
  }
}
