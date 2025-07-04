import { Router } from "oak";
import { ChatController } from "@/controllers/chat.controller.ts";
import { authMiddleware } from "@/middleware/auth.middleware.ts";

const router = new Router();

// All data routes require authentication
router.use(authMiddleware);

// Bootstrap data for frontend
router.get("/bootstrap", ChatController.getBootstrapData);

export default router;
