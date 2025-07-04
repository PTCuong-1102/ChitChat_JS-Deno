import { z } from "zod";
import { db } from "@/config/database.ts";
import { HashUtils } from "@/utils/hash.ts";
import { JWTUtils } from "@/utils/jwt.ts";
import { RegisterRequest, LoginRequest, AuthResponse, User } from "@/types/index.ts";

// Validation schemas
export const RegisterSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  userName: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be less than 20 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export class AuthService {
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    // Validate input
    const validatedData = RegisterSchema.parse(data);

    // Check if user already exists
    const existingUser = await db.query(
      "SELECT id FROM auth_users WHERE email = $1",
      [validatedData.email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error("User already exists with this email");
    }

    // Check if username is taken
    const existingUsername = await db.query(
      "SELECT id FROM users WHERE user_name = $1",
      [validatedData.userName]
    );

    if (existingUsername.rows.length > 0) {
      throw new Error("Username is already taken");
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await HashUtils.hashPassword(validatedData.password);
    console.log('✅ Password hashed successfully');
    console.log('📝 Hash format:', passwordHash.includes(':') ? 'Valid (salt:hash)' : 'Invalid format');

    // Create user in transaction
    const result = await db.transaction(async (client) => {
      // Create auth user
      const authUserResult = await client.queryObject(
        `INSERT INTO auth_users (email, password_hash) 
         VALUES ($1, $2) 
         RETURNING id, email, created_at`,
        [validatedData.email, passwordHash]
      );

      const authUser = authUserResult.rows[0] as any;

      // Create user profile
      const userResult = await client.queryObject(
        `INSERT INTO users (id, email, full_name, user_name, status) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [authUser.id, validatedData.email, validatedData.fullName, validatedData.userName, true]
      );

      return userResult.rows[0] as User;
    });

    // Generate JWT token
    const token = await JWTUtils.generateToken(result.id);

    return {
      user: result,
      token,
    };
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    // Validate input
    const validatedData = LoginSchema.parse(data);

    // Find user by email
    const userResult = await db.query(
      `SELECT au.id, au.email, au.password_hash, u.full_name, u.user_name, u.avatar_url, u.status
       FROM auth_users au
       JOIN users u ON au.id = u.id
       WHERE au.email = $1`,
      [validatedData.email]
    );

    if (userResult.rows.length === 0) {
      throw new Error("Invalid email or password");
    }

    const userData = userResult.rows[0] as any;

    // Verify password
    console.log('🔍 Verifying password...');
    console.log('📝 Stored hash format:', userData.password_hash?.includes(':') ? 'Valid' : 'Invalid');
    
    const isValidPassword = await HashUtils.comparePassword(
      validatedData.password,
      userData.password_hash
    );
    
    console.log('🔑 Password verification result:', isValidPassword);

    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = await JWTUtils.generateToken(userData.id);

    // Return user data without password hash
    const user: User = {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      user_name: userData.user_name,
      avatar_url: userData.avatar_url,
      status: userData.status,
    };

    return {
      user,
      token,
    };
  }

  static async getUserById(userId: string): Promise<User | null> {
    const result = await db.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as User;
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get current password hash
    const userResult = await db.query(
      "SELECT password_hash FROM auth_users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error("User not found");
    }

    const userData = userResult.rows[0] as any;

    // Verify current password
    const isValidPassword = await HashUtils.comparePassword(
      currentPassword,
      userData.password_hash
    );

    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const newPasswordHash = await HashUtils.hashPassword(newPassword);

    // Update password
    await db.query(
      "UPDATE auth_users SET password_hash = $1 WHERE id = $2",
      [newPasswordHash, userId]
    );
  }
}
