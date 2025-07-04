import { Context } from "oak";
import { ChatService } from "@/services/chat.service.ts";
import { UserService } from "@/services/user.service.ts";
import { SendMessageRequest } from "@/types/index.ts";

export class ChatController {
  static async getUserChats(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const chats = await ChatService.getUserChats(userId);

      ctx.response.status = 200;
      ctx.response.body = chats;
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async getChatMessages(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const chatId = ctx.params.chatId;
      const limit = parseInt(ctx.request.url.searchParams.get("limit") || "50");
      const offset = parseInt(ctx.request.url.searchParams.get("offset") || "0");

      const messages = await ChatService.getChatMessages(chatId, userId, limit, offset);

      ctx.response.status = 200;
      ctx.response.body = messages;
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async sendMessage(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const chatId = ctx.params.chatId;
      const body = await ctx.request.body().value;

      const data: SendMessageRequest = {
        content: body.content,
        messageType: body.messageType || 'text',
      };

      const message = await ChatService.sendMessage(chatId, userId, data);

      ctx.response.status = 201;
      ctx.response.body = message;
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async createDirectMessage(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const body = await ctx.request.body().value;
      const otherUserId = body.userId;

      const chat = await ChatService.createDirectMessage(userId, otherUserId);

      ctx.response.status = 201;
      ctx.response.body = chat;
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async createGroupChat(ctx: Context) {
    try {
      const userId = ctx.state.userId;
      const body = await ctx.request.body().value;

      const chat = await ChatService.createGroupChat(
        body.name,
        userId,
        body.participantIds || []
      );

      ctx.response.status = 201;
      ctx.response.body = chat;
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async getRoomParticipants(ctx: Context) {
    try {
      const roomId = ctx.params.chatId;
      const participants = await ChatService.getRoomParticipants(roomId);

      ctx.response.status = 200;
      ctx.response.body = participants;
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }

  static async getBootstrapData(ctx: Context) {
    try {
      const userId = ctx.state.userId;

      // Get all data needed for the frontend
      const [chats, users, contacts] = await Promise.all([
        ChatService.getUserChats(userId),
        UserService.getAllUsers(),
        UserService.getUserContacts(userId),
      ]);

      ctx.response.status = 200;
      ctx.response.body = {
        chats,
        users,
        contacts,
        bots: [], // TODO: Implement bot service
        tags: [], // TODO: Implement tag system
      };
    } catch (error) {
      ctx.response.status = 400;
      ctx.response.body = { error: error.message };
    }
  }
}
