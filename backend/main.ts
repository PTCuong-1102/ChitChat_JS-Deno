import { Application } from "oak";
import { send } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { router } from "./src/routes/index.ts";
import { corsMiddleware } from "./src/middleware/cors.middleware.ts";
import { errorMiddleware } from "./src/middleware/error.middleware.ts";
import { loggerMiddleware } from "./src/middleware/logger.middleware.ts";
import { db } from "./src/config/database.ts";
import { config } from "./src/config/env.ts";
import { UploadService } from "./src/services/upload.service.ts";

const app = new Application();

// Connect to database
await db.connect();

// Initialize upload directories
await UploadService.initializeUploadDirectory();

// Global middleware
app.use(errorMiddleware);
app.use(loggerMiddleware);
app.use(corsMiddleware);

// Static file serving for uploads
app.use(async (ctx, next) => {
  if (ctx.request.url.pathname.startsWith("/uploads/")) {
    console.log('📁 Static file request:', {
      pathname: ctx.request.url.pathname,
      method: ctx.request.method,
      userAgent: ctx.request.headers.get('user-agent')
    });
    
    try {
      await send(ctx, ctx.request.url.pathname, {
        root: "./",
        index: false,
      });
      
      console.log('✅ Static file served successfully:', ctx.request.url.pathname);
    } catch (error) {
      console.log('❌ Static file not found or error:', {
        pathname: ctx.request.url.pathname,
        error: error.message
      });
      
      // Continue to next middleware (which will handle 404)
      await next();
    }
  } else {
    await next();
  }
});

// Parse request body - Oak handles this automatically

// Routes
app.use(router.routes());
app.use(router.allowedMethods());

// Handle 404
app.use((ctx) => {
  ctx.response.status = 404;
  ctx.response.body = { error: "Not Found" };
});

// Graceful shutdown
const abortController = new AbortController();

// Handle shutdown signals
if (Deno.build.os !== "windows") {
  Deno.addSignalListener("SIGINT", () => {
    console.log("\n🛑 Received SIGINT, shutting down gracefully...");
    abortController.abort();
  });

  Deno.addSignalListener("SIGTERM", () => {
    console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
    abortController.abort();
  });
}

// Start server
const port = config.server.port;
console.log(`🚀 ChitChat Backend API starting on port ${port}...`);

try {
  await app.listen({ 
    port, 
    signal: abortController.signal,
    onListen: ({ port, hostname }) => {
      console.log(`✅ Server is running on http://${hostname || "localhost"}:${port}`);
      console.log(`📋 Health check: http://localhost:${port}/health`);
      console.log(`🔗 API docs: http://localhost:${port}/api`);
    }
  });
} catch (error) {
  if (error instanceof Deno.errors.Interrupted) {
    console.log("⏹️  Server stopped gracefully");
  } else {
    console.error("❌ Server error:", error);
  }
} finally {
  await db.disconnect();
  console.log("👋 Goodbye!");
}
