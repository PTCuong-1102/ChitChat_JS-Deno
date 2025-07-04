export class HashUtils {
  private static async generateSalt(): Promise<string> {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await this.generateSalt();
      const encoder = new TextEncoder();
      const data = encoder.encode(password + salt);
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
      
      // Store salt + hash together
      return salt + ':' + hashHex;
    } catch (error) {
      console.error('Hash error:', error);
      throw new Error("Failed to hash password");
    }
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const [salt, hash] = hashedPassword.split(':');
      if (!salt || !hash) {
        return false;
      }
      
      const encoder = new TextEncoder();
      const data = encoder.encode(password + salt);
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
      
      return hashHex === hash;
    } catch (error) {
      console.error('Compare error:', error);
      throw new Error("Failed to compare password");
    }
  }
}
