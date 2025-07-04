import { Router } from "oak";
import { UploadController } from "@/controllers/upload.controller.ts";
import { authMiddleware } from "@/middleware/auth.middleware.ts";

const router = new Router();

// All upload routes require authentication
router.use(authMiddleware);

// Profile image upload
router.post("/profile", UploadController.uploadProfileImage);

// Chat image upload
router.post("/chat", UploadController.uploadChatImage);

// Delete image
router.delete("/delete", UploadController.deleteImage);

export default router;
