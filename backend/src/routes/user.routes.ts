import { Router } from "oak";
import { UserController } from "@/controllers/user.controller.ts";
import { authMiddleware } from "@/middleware/auth.middleware.ts";

const router = new Router();

// All user routes require authentication
router.use(authMiddleware);

// User management
router.get("/", UserController.getAllUsers);
router.get("/search", UserController.searchUsers);
router.put("/me", UserController.updateProfile);

// Contact management
router.get("/contacts", UserController.getUserContacts);
router.post("/contacts", UserController.addContact);
router.delete("/contacts/:userId", UserController.removeContact);

// Blocking management
router.get("/blocked", UserController.getBlockedUsers);
router.post("/block", UserController.blockUser);
router.post("/unblock", UserController.unblockUser);

export default router;
