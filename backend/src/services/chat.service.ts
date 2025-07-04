import { db } from "@/config/database.ts";
import { ChatRoom, Message, RoomParticipant, SendMessageRequest } from "@/types/index.ts";

export class ChatService {
  static async getUserChats(userId: string): Promise<any[]> {
    const result = await db.query(
      `SELECT DISTINCT 
        cr.id,
        cr.name,
        cr.is_group,
        cr.created_at,
        COALESCE(
          ARRAY_AGG(DISTINCT rp.user_id) FILTER (WHERE rp.user_id IS NOT NULL),
          ARRAY[]::uuid[]
        ) as participants,
        (
          SELECT m.content 
          FROM messages m 
          WHERE m.room_id = cr.id 
          ORDER BY m.sent_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT m.sent_at 
          FROM messages m 
          WHERE m.room_id = cr.id 
          ORDER BY m.sent_at DESC 
          LIMIT 1
        ) as last_message_timestamp
      FROM chat_rooms cr
      JOIN room_participants rp ON cr.id = rp.room_id
      LEFT JOIN room_participants rp2 ON cr.id = rp2.room_id
      WHERE cr.is_deleted = false 
        AND rp.user_id = $1
      GROUP BY cr.id, cr.name, cr.is_group, cr.created_at
      ORDER BY last_message_timestamp DESC NULLS LAST`,
      [userId]
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      isGroup: row.is_group,
      name: row.name,
      participants: row.participants,
      lastMessage: row.last_message,
      lastMessageTimestamp: row.last_message_timestamp?.toISOString(),
    }));
  }

  static async getChatMessages(chatId: string, userId: string, limit = 50, offset = 0): Promise<Message[]> {
    // First verify user is participant in this chat
    const participantCheck = await db.query(
      "SELECT 1 FROM room_participants WHERE room_id = $1 AND user_id = $2",
      [chatId, userId]
    );

    if (participantCheck.rows.length === 0) {
      throw new Error("You are not a participant in this chat");
    }

    const result = await db.query(
      `SELECT m.*, u.full_name, u.user_name, u.avatar_url
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.sent_at DESC
       LIMIT $2 OFFSET $3`,
      [chatId, limit, offset]
    );

    return result.rows.map((row: any) => ({
      id: row.id.toString(),
      senderId: row.sender_id,
      content: row.content,
      timestamp: row.sent_at.toISOString(),
      sender: {
        id: row.sender_id,
        name: row.full_name,
        username: row.user_name,
        avatar: row.avatar_url,
      },
    }));
  }

  static async sendMessage(chatId: string, senderId: string, data: SendMessageRequest): Promise<Message> {
    // Verify user is participant in this chat
    const participantCheck = await db.query(
      "SELECT 1 FROM room_participants WHERE room_id = $1 AND user_id = $2",
      [chatId, senderId]
    );

    if (participantCheck.rows.length === 0) {
      throw new Error("You are not a participant in this chat");
    }

    // Insert message
    const result = await db.query(
      `INSERT INTO messages (room_id, sender_id, content, message_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [chatId, senderId, data.content, data.messageType || 'text']
    );

    const message = result.rows[0] as any;

    // Get sender info
    const senderResult = await db.query(
      "SELECT full_name, user_name, avatar_url FROM users WHERE id = $1",
      [senderId]
    );

    const sender = senderResult.rows[0] as any;

    return {
      id: message.id.toString(),
      room_id: message.room_id,
      sender_id: message.sender_id,
      content: message.content,
      message_type: message.message_type,
      sent_at: message.sent_at,
      is_read: message.is_read,
      sender: {
        id: sender.id,
        name: sender.full_name,
        username: sender.user_name,
        avatar: sender.avatar_url,
      },
    } as any;
  }

  static async createDirectMessage(userId1: string, userId2: string): Promise<ChatRoom> {
    // Check if DM already exists
    const existingChat = await db.query(
      `SELECT cr.id 
       FROM chat_rooms cr
       JOIN room_participants rp1 ON cr.id = rp1.room_id
       JOIN room_participants rp2 ON cr.id = rp2.room_id
       WHERE cr.is_group = false 
         AND rp1.user_id = $1 
         AND rp2.user_id = $2
         AND cr.is_deleted = false`,
      [userId1, userId2]
    );

    if (existingChat.rows.length > 0) {
      const chatId = existingChat.rows[0].id;
      const chatResult = await db.query("SELECT * FROM chat_rooms WHERE id = $1", [chatId]);
      return chatResult.rows[0] as ChatRoom;
    }

    // Create new DM
    const result = await db.transaction(async (client) => {
      // Create chat room
      const chatResult = await client.queryObject(
        `INSERT INTO chat_rooms (is_group, is_deleted)
         VALUES (false, false)
         RETURNING *`,
        []
      );

      const chat = chatResult.rows[0] as ChatRoom;

      // Add participants
      await client.queryObject(
        `INSERT INTO room_participants (room_id, user_id)
         VALUES ($1, $2), ($1, $3)`,
        [chat.id, userId1, userId2]
      );

      return chat;
    });

    return result;
  }

  static async createGroupChat(name: string, creatorId: string, participantIds: string[]): Promise<ChatRoom> {
    const result = await db.transaction(async (client) => {
      // Create chat room
      const chatResult = await client.queryObject(
        `INSERT INTO chat_rooms (name, is_group, is_deleted)
         VALUES ($1, true, false)
         RETURNING *`,
        [name]
      );

      const chat = chatResult.rows[0] as ChatRoom;

      // Add creator as admin
      await client.queryObject(
        `INSERT INTO user_role (user_id, chat_rooms_id, role)
         VALUES ($1, $2, 'admin')`,
        [creatorId, chat.id]
      );

      // Add all participants (including creator)
      const allParticipants = [creatorId, ...participantIds.filter(id => id !== creatorId)];
      const participantValues = allParticipants.map((_, index) => `($1, $${index + 2})`).join(', ');
      
      await client.queryObject(
        `INSERT INTO room_participants (room_id, user_id)
         VALUES ${participantValues}`,
        [chat.id, ...allParticipants]
      );

      return chat;
    });

    return result;
  }

  static async getRoomParticipants(roomId: string): Promise<any[]> {
    const result = await db.query(
      `SELECT u.id, u.full_name, u.user_name, u.avatar_url, u.status,
              ur.role
       FROM room_participants rp
       JOIN users u ON rp.user_id = u.id
       LEFT JOIN user_role ur ON ur.user_id = u.id AND ur.chat_rooms_id = rp.room_id
       WHERE rp.room_id = $1`,
      [roomId]
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.full_name,
      username: row.user_name,
      avatar: row.avatar_url,
      status: row.status ? 'online' : 'offline',
      role: row.role || 'member',
    }));
  }
}
