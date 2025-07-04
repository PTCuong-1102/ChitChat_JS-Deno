import { SignJWT, jwtVerify } from "jose";
import { config } from "@/config/env.ts";

const jwtSecret = new TextEncoder().encode(config.jwt.secret);

export class JWTUtils {
  static async generateToken(userId: string): Promise<string> {
    const jwt = await new SignJWT({ sub: userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(jwtSecret);

    return jwt;
  }

  static async verifyToken(token: string): Promise<string> {
    try {
      const { payload } = await jwtVerify(token, jwtSecret);
      return payload.sub as string;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  static extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }
}
