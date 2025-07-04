import { Router } from "oak";
import { AuthController } from "@/controllers/auth.controller.ts";
import { authMiddleware } from "@/middleware/auth.middleware.ts";

const router = new Router();

// Test endpoint
router.get("/test", (ctx) => {
  ctx.response.body = { message: "Auth routes working!" };
});

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Protected routes
router.get("/me", authMiddleware, AuthController.me);
router.post("/logout", authMiddleware, AuthController.logout);
router.put("/change-password", authMiddleware, AuthController.changePassword);

export default router;
