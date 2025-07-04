import { Router } from "oak";
import { ChatController } from "@/controllers/chat.controller.ts";
import { authMiddleware } from "@/middleware/auth.middleware.ts";

const router = new Router();

// All chat routes require authentication
router.use(authMiddleware);

// Chat room routes
router.get("/rooms", ChatController.getUserChats);
router.post("/rooms", ChatController.createGroupChat);
router.post("/rooms/dm", ChatController.createDirectMessage);

// Chat message routes
router.get("/rooms/:chatId/messages", ChatController.getChatMessages);
router.post("/rooms/:chatId/messages", ChatController.sendMessage);
router.get("/rooms/:chatId/participants", ChatController.getRoomParticipants);

export default router;
