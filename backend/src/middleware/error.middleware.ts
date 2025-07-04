import { Middleware } from "oak";

export const errorMiddleware: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error("❌ Error occurred:");
    console.error("  Method:", ctx.request.method);
    console.error("  URL:", ctx.request.url.toString());
    console.error("  Error:", error);
    
    ctx.response.status = error.status || 500;
    ctx.response.body = {
      error: error.message || "Internal Server Error",
      method: ctx.request.method,
      url: ctx.request.url.pathname,
      ...(Deno.env.get("NODE_ENV") === "development" && { stack: error.stack }),
    };
  }
};
