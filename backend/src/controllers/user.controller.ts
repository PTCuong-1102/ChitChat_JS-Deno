import { Context } from "oak";
import { UserService } from "@/services/user.service.ts";

export class UserController {
  static async getAllUsers(ctx: Context) {
    try {
      const users = await UserService.getAllUsers();

      ctx.response.status = 200;
      ctx.response.body = users;
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async searchUsers(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const query = ctx.request.url.searchParams.get("q") || "";

      if (!query.trim()) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Query parameter 'q' is required" };
        return;
      }

      const users = await UserService.searchUsers(query, userId);

      ctx.response.status = 200;
      ctx.response.body = users;
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async updateProfile(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const body = await ctx.request.body().value;

      console.log('👤 UserController.updateProfile called:', {
        userId,
        requestBody: body
      });

      const updates: any = {};
      if (body.name) updates.full_name = body.name;
      if (body.username) updates.user_name = body.username;
      if (body.email) updates.email = body.email;
      if (body.avatar) updates.avatar_url = body.avatar;

      console.log('🔄 Updates to be applied:', updates);

      const user = await UserService.updateProfile(userId, updates);

      console.log('✅ Profile updated successfully:', {
        userId,
        updatedUser: user
      });

      ctx.response.status = 200;
      ctx.response.body = { user };
    } catch (error) {
      console.error('❌ Profile update failed:', {
        userId: ctx.state.userId,
        error: error.message,
        stack: error.stack
      });
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async getUserContacts(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const contacts = await UserService.getUserContacts(userId);

      ctx.response.status = 200;
      ctx.response.body = contacts;
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async addContact(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const body = await ctx.request.body().value;
      const friendId = body.userId;

      await UserService.addContact(userId, friendId);

      ctx.response.status = 200;
      ctx.response.body = { message: "Contact added successfully" };
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async removeContact(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const friendId = ctx.params.userId;

      await UserService.removeContact(userId, friendId);

      ctx.response.status = 200;
      ctx.response.body = { message: "Contact removed successfully" };
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async blockUser(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const body = await ctx.request.body().value;
      const blockedUserId = body.userId;

      await UserService.blockUser(userId, blockedUserId);

      ctx.response.status = 200;
      ctx.response.body = { message: "User blocked successfully" };
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async unblockUser(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const body = await ctx.request.body().value;
      const blockedUserId = body.userId;

      await UserService.unblockUser(userId, blockedUserId);

      ctx.response.status = 200;
      ctx.response.body = { message: "User unblocked successfully" };
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async getBlockedUsers(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const blockedUsers = await UserService.getBlockedUsers(userId);

      ctx.response.status = 200;
      ctx.response.body = blockedUsers;
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }
}
