import { Client } from "postgres";
import { config } from "./env.ts";

class Database {
  private static instance: Database;
  private client: Client;
  private isConnected: boolean = false;

  private constructor() {
    this.client = new Client(config.database.url);
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.isConnected = true;
      console.log("✅ Connected to PostgreSQL database");
    } catch (error) {
      console.error("❌ Failed to connect to database:", error);
      this.isConnected = false;
      throw error;
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!this.isConnected) {
      console.log("🔄 Reconnecting to database...");
      this.client = new Client(config.database.url);
      await this.connect();
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.end();
      console.log("🔌 Disconnected from database");
    } catch (error) {
      console.error("❌ Error disconnecting from database:", error);
    }
  }

  public getClient(): Client {
    return this.client;
  }

  public async query(text: string, params?: any[]): Promise<any> {
    try {
      await this.ensureConnection();
      const result = await this.client.queryObject(text, params);
      return result;
    } catch (error) {
      console.error("❌ Database query error:", error);
      this.isConnected = false;
      
      // Try once more with reconnection
      try {
        console.log("🔄 Retrying query with fresh connection...");
        await this.ensureConnection();
        const result = await this.client.queryObject(text, params);
        return result;
      } catch (retryError) {
        console.error("❌ Retry failed:", retryError);
        throw retryError;
      }
    }
  }

  public async transaction<T>(callback: (client: Client) => Promise<T>): Promise<T> {
    const client = this.client;
    try {
      await client.queryObject("BEGIN");
      const result = await callback(client);
      await client.queryObject("COMMIT");
      return result;
    } catch (error) {
      await client.queryObject("ROLLBACK");
      throw error;
    }
  }
}

export const db = Database.getInstance();
