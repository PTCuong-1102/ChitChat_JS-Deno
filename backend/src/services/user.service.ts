import { db } from "@/config/database.ts";
import { User } from "@/types/index.ts";

export class UserService {
  static async getAllUsers(): Promise<User[]> {
    const result = await db.query(
      "SELECT id, email, full_name, user_name, avatar_url, status FROM users WHERE status = true",
      []
    );

    return result.rows as User[];
  }

  static async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    const result = await db.query(
      `SELECT id, email, full_name, user_name, avatar_url, status 
       FROM users 
       WHERE status = true 
         AND id != $1
         AND (
           LOWER(full_name) LIKE LOWER($2) OR 
           LOWER(user_name) LIKE LOWER($2) OR
           LOWER(email) LIKE LOWER($2)
         )
       LIMIT 20`,
      [currentUserId, `%${query}%`]
    );

    return result.rows as User[];
  }

  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    console.log(`🔄 UserService.updateProfile called:`, {
      userId,
      updates
    });
    
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id')
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [userId, ...Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id')];
    
    const query = `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`;
    
    console.log(`📝 SQL Query:`, {
      query,
      values
    });

    const result = await db.query(query, values);
    
    console.log(`📋 Query result:`, {
      rowCount: result.rows.length,
      user: result.rows[0]
    });

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0] as User;
  }

  static async getUserContacts(userId: string): Promise<User[]> {
    const result = await db.query(
      `SELECT u.id, u.email, u.full_name, u.user_name, u.avatar_url, u.status
       FROM user_contacts uc
       JOIN users u ON uc.friend_id = u.id
       WHERE uc.user_id = $1 AND u.status = true`,
      [userId]
    );

    return result.rows as User[];
  }

  static async addContact(userId: string, friendId: string): Promise<void> {
    // Check if contact already exists
    const existing = await db.query(
      "SELECT 1 FROM user_contacts WHERE user_id = $1 AND friend_id = $2",
      [userId, friendId]
    );

    if (existing.rows.length > 0) {
      throw new Error("Contact already exists");
    }

    // Check if friend exists
    const friendExists = await db.query(
      "SELECT 1 FROM users WHERE id = $1 AND status = true",
      [friendId]
    );

    if (friendExists.rows.length === 0) {
      throw new Error("User not found");
    }

    // Add mutual contacts
    await db.transaction(async (client) => {
      await client.queryObject(
        "INSERT INTO user_contacts (user_id, friend_id) VALUES ($1, $2)",
        [userId, friendId]
      );

      await client.queryObject(
        "INSERT INTO user_contacts (user_id, friend_id) VALUES ($1, $2)",
        [friendId, userId]
      );
    });
  }

  static async removeContact(userId: string, friendId: string): Promise<void> {
    await db.transaction(async (client) => {
      await client.queryObject(
        "DELETE FROM user_contacts WHERE user_id = $1 AND friend_id = $2",
        [userId, friendId]
      );

      await client.queryObject(
        "DELETE FROM user_contacts WHERE user_id = $1 AND friend_id = $2",
        [friendId, userId]
      );
    });
  }

  static async blockUser(userId: string, blockedUserId: string): Promise<void> {
    // Check if already blocked
    const existing = await db.query(
      "SELECT 1 FROM blocked_users WHERE user_id = $1 AND blocked_user_id = $2",
      [userId, blockedUserId]
    );

    if (existing.rows.length > 0) {
      throw new Error("User already blocked");
    }

    await db.query(
      "INSERT INTO blocked_users (user_id, blocked_user_id) VALUES ($1, $2)",
      [userId, blockedUserId]
    );

    // Remove from contacts if they were friends
    await this.removeContact(userId, blockedUserId);
  }

  static async unblockUser(userId: string, blockedUserId: string): Promise<void> {
    await db.query(
      "DELETE FROM blocked_users WHERE user_id = $1 AND blocked_user_id = $2",
      [userId, blockedUserId]
    );
  }

  static async getBlockedUsers(userId: string): Promise<User[]> {
    const result = await db.query(
      `SELECT u.id, u.email, u.full_name, u.user_name, u.avatar_url, u.status
       FROM blocked_users bu
       JOIN users u ON bu.blocked_user_id = u.id
       WHERE bu.user_id = $1`,
      [userId]
    );

    return result.rows as User[];
  }

  static async isBlocked(userId: string, otherUserId: string): Promise<boolean> {
    const result = await db.query(
      "SELECT 1 FROM blocked_users WHERE user_id = $1 AND blocked_user_id = $2",
      [userId, otherUserId]
    );

    return result.rows.length > 0;
  }
}
