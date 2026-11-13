import crypto from "crypto";

/**
 * JwtTokenProvider generating and verifying HMAC SHA-256 JWT tokens.
 */
export class JwtTokenProvider {
  constructor(private readonly secret: string) {}

  /**
   * Generates a signed token with expiration time block.
   */
  public generateToken(payload: any, expiresInMinutes: number): string {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const exp = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
    const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
    const signature = crypto.createHmac("sha256", this.secret).update(`${header}.${body}`).digest("base64url");
    return `${header}.${body}.${signature}`;
  }

  /**
   * Verifies signatures and expiration parameters.
   */
  public verifyToken(token: string): any {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }
    const [header, body, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", this.secret).update(`${header}.${body}`).digest("base64url");
    if (signature !== expectedSignature) {
      throw new Error("Invalid signature");
    }
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Token expired");
    }
    return payload;
  }
}
