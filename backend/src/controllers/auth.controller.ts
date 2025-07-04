import { Context } from "oak";
import { AuthService } from "@/services/auth.service.ts";
import { RegisterRequest, LoginRequest } from "@/types/index.ts";

export class AuthController {
  static async register(ctx: Context) {
    try {
      console.log("📝 Register request received:");
      console.log("  Method:", ctx.request.method);
      console.log("  Content-Type:", ctx.request.headers.get("content-type"));
      
      const body = await ctx.request.body().value;
      console.log("  Body:", body);
      const data: RegisterRequest = {
        fullName: body.fullName,
        userName: body.userName,
        email: body.email,
        password: body.password,
      };

      const result = await AuthService.register(data);

      ctx.response.status = 201;
      ctx.response.body = result;
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async login(ctx: Context) {
    try {
      const body = await ctx.request.body().value;
      const data: LoginRequest = {
        email: body.email,
        password: body.password,
      };

      const result = await AuthService.login(data);

      ctx.response.status = 200;
      ctx.response.body = result;
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async me(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const user = await AuthService.getUserById(userId);

      if (!user) {
        ctx.response.status = 404;
        ctx.response.body = { error: "User not found" };
        return;
      }

      ctx.response.status = 200;
      ctx.response.body = { user };
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async logout(ctx: Context) {
    try {
      // In a stateless JWT system, logout is mainly handled on the frontend
      // by removing the token. But we can log it for audit purposes.
      const userId = ctx.state.userId;
      console.log(`👋 User logout: ${userId}`);
      
      ctx.response.status = 200;
      ctx.response.body = { 
        message: "Logged out successfully",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async changePassword(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const body = await ctx.request.body().value;
      
      const { currentPassword, newPassword } = body;
      
      if (!currentPassword || !newPassword) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Current password and new password are required" };
        return;
      }
      
      if (newPassword.length < 6) {
        ctx.response.status = 400;
        ctx.response.body = { error: "New password must be at least 6 characters long" };
        return;
      }
      
      await AuthService.changePassword(userId, currentPassword, newPassword);
      
      ctx.response.status = 200;
      ctx.response.body = { message: "Password changed successfully" };
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }
}
