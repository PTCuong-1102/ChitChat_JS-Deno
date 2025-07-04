import { Middleware } from "oak";

export const loggerMiddleware: Middleware = async (ctx, next) => {
  const start = Date.now();
  
  await next();
  
  const ms = Date.now() - start;
  const status = ctx.response.status;
  const method = ctx.request.method;
  const url = ctx.request.url.pathname;
  
  // Color codes for status
  let statusColor = "";
  if (status >= 200 && status < 300) statusColor = "\x1b[32m"; // Green
  else if (status >= 300 && status < 400) statusColor = "\x1b[33m"; // Yellow
  else if (status >= 400 && status < 500) statusColor = "\x1b[31m"; // Red
  else if (status >= 500) statusColor = "\x1b[35m"; // Magenta
  
  console.log(
    `${new Date().toISOString()} ${method} ${url} ${statusColor}${status}\x1b[0m - ${ms}ms`
  );
};
