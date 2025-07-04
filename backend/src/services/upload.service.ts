import { ensureDir } from "https://deno.land/std@0.208.0/fs/mod.ts";
import { extname } from "https://deno.land/std@0.208.0/path/mod.ts";

export class UploadService {
  private static uploadDir = "./uploads";
  private static allowedImageTypes = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  private static maxFileSize = 5 * 1024 * 1024; // 5MB

  static async initializeUploadDirectory(): Promise<void> {
    try {
      await ensureDir(this.uploadDir);
      await ensureDir(`${this.uploadDir}/profiles`);
      await ensureDir(`${this.uploadDir}/chat`);
      console.log("✅ Upload directories initialized");
    } catch (error) {
      console.error("❌ Failed to initialize upload directories:", error);
      throw error;
    }
  }

  static generateFileName(originalName: string, userId: string): string {
    const ext = extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${userId}_${timestamp}_${randomString}${ext}`;
  }

  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const ext = extname(file.name).toLowerCase();
    if (!this.allowedImageTypes.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${this.allowedImageTypes.join(", ")}`
      };
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`
      };
    }

    return { valid: true };
  }

  static async saveProfileImage(file: File, userId: string): Promise<string> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileName = this.generateFileName(file.name, userId);
    const filePath = `${this.uploadDir}/profiles/${fileName}`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      await Deno.writeFile(filePath, new Uint8Array(arrayBuffer));
      
      // Return the public URL path
      return `/uploads/profiles/${fileName}`;
    } catch (error) {
      console.error("❌ Failed to save profile image:", error);
      throw new Error("Failed to save image file");
    }
  }

  static async saveChatImage(file: File, userId: string): Promise<string> {
    const validation = this.validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileName = this.generateFileName(file.name, userId);
    const filePath = `${this.uploadDir}/chat/${fileName}`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      await Deno.writeFile(filePath, new Uint8Array(arrayBuffer));
      
      // Return the public URL path
      return `/uploads/chat/${fileName}`;
    } catch (error) {
      console.error("❌ Failed to save chat image:", error);
      throw new Error("Failed to save image file");
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = `.${filePath}`; // Add dot for relative path
      await Deno.remove(fullPath);
      console.log(`🗑️ Deleted file: ${filePath}`);
    } catch (error) {
      console.warn(`⚠️ Could not delete file ${filePath}:`, error);
      // Don't throw - file might already be deleted
    }
  }

  static getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
