import { Middleware } from "oak";
import { JWTUtils } from "@/utils/jwt.ts";

export const authMiddleware: Middleware = async (ctx, next) => {
  const authHeader = ctx.request.headers.get("Authorization");
  const token = JWTUtils.extractTokenFromHeader(authHeader);

  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized" };
    return;
  }

  try {
    const userId = await JWTUtils.verifyToken(token);
    ctx.state.userId = userId;
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid token" };
  }
};
