import { Router } from "oak";
import authRoutes from "./auth.routes.ts";
import chatRoutes from "./chat.routes.ts";
import userRoutes from "./user.routes.ts";
import dataRoutes from "./data.routes.ts";
import uploadRoutes from "./upload.routes.ts";

const router = new Router();

// Root endpoint
router.get("/", (ctx) => {
  ctx.response.body = {
    message: "ChitChat Backend API",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      chat: "/api/chat",
      users: "/api/users",
      data: "/api/data"
    }
  };
});

// Health check endpoint
router.get("/health", (ctx) => {
  ctx.response.body = { 
    status: "ok", 
    timestamp: new Date().toISOString(),
    service: "ChitChat Backend API"
  };
});

// API routes
router.use("/api/auth", authRoutes.routes(), authRoutes.allowedMethods());
router.use("/api/chat", chatRoutes.routes(), chatRoutes.allowedMethods());
router.use("/api/users", userRoutes.routes(), userRoutes.allowedMethods());
router.use("/api/data", dataRoutes.routes(), dataRoutes.allowedMethods());
router.use("/api/upload", uploadRoutes.routes(), uploadRoutes.allowedMethods());

export { router };
