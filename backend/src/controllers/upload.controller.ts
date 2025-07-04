import { Context } from "oak";
import { UploadService } from "@/services/upload.service.ts";
import { UserService } from "@/services/user.service.ts";

export class UploadController {
  static async uploadProfileImage(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      
      if (!ctx.request.hasBody) {
        ctx.response.status = 400;
        ctx.response.body = { error: "No file provided" };
        return;
      }

      const body = ctx.request.body();
      
      if (body.type !== "form-data") {
        ctx.response.status = 400;
        ctx.response.body = { error: "Expected multipart/form-data" };
        return;
      }

      const formData = await body.value.read();
      const file = formData.files?.find(f => f.name === "avatar");

      if (!file) {
        ctx.response.status = 400;
        ctx.response.body = { error: "No avatar file found" };
        return;
      }

      console.log(`📸 Profile image upload request:`, {
        userId,
        fileName: file.filename,
        fileSize: UploadService.getFileSize(file.content?.length || 0)
      });

      // Convert file content to File object for validation
      const fileObj = new File([file.content || new Uint8Array()], file.filename || "avatar", {
        type: file.contentType
      });

      // Save the file
      const imageUrl = await UploadService.saveProfileImage(fileObj, userId);

      // Update user's avatar URL in database
      console.log(`🔄 Updating user profile with avatar URL:`, {
        userId,
        imageUrl
      });
      
      const updatedUser = await UserService.updateProfile(userId, {
        avatar_url: imageUrl
      });

      console.log(`✅ Profile image uploaded successfully:`, {
        userId,
        imageUrl,
        newAvatarUrl: updatedUser.avatar_url,
        fullUser: updatedUser
      });

      ctx.response.status = 200;
      ctx.response.body = {
        message: "Profile image uploaded successfully",
        imageUrl,
        user: updatedUser
      };

    } catch (error) {
      console.error("❌ Profile image upload failed:", error);
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async uploadChatImage(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      
      if (!ctx.request.hasBody) {
        ctx.response.status = 400;
        ctx.response.body = { error: "No file provided" };
        return;
      }

      const body = ctx.request.body();
      
      if (body.type !== "form-data") {
        ctx.response.status = 400;
        ctx.response.body = { error: "Expected multipart/form-data" };
        return;
      }

      const formData = await body.value.read();
      const file = formData.files?.find(f => f.name === "image");

      if (!file) {
        ctx.response.status = 400;
        ctx.response.body = { error: "No image file found" };
        return;
      }

      console.log(`🖼️ Chat image upload request:`, {
        userId,
        fileName: file.filename,
        fileSize: UploadService.getFileSize(file.content?.length || 0)
      });

      // Convert file content to File object for validation
      const fileObj = new File([file.content || new Uint8Array()], file.filename || "image", {
        type: file.contentType
      });

      // Save the file
      const imageUrl = await UploadService.saveChatImage(fileObj, userId);

      console.log(`✅ Chat image uploaded successfully:`, {
        userId,
        imageUrl
      });

      ctx.response.status = 200;
      ctx.response.body = {
        message: "Image uploaded successfully",
        imageUrl
      };

    } catch (error) {
      console.error("❌ Chat image upload failed:", error);
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async deleteImage(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const body = await ctx.request.body().value;
      const { imageUrl } = body;

      if (!imageUrl) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Image URL is required" };
        return;
      }

      // Basic security check - ensure user can only delete their own files
      if (!imageUrl.includes(userId)) {
        ctx.response.status = 403;
        ctx.response.body = { error: "Unauthorized to delete this file" };
        return;
      }

      await UploadService.deleteFile(imageUrl);

      ctx.response.status = 200;
      ctx.response.body = { message: "Image deleted successfully" };

    } catch (error) {
      console.error("❌ Image deletion failed:", error);
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }
}
