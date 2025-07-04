export const config = {
  database: {
    url: Deno.env.get("DATABASE_URL") || "postgresql://neondb_owner:npg_sFid7Gfq8DcS@ep-empty-snowflake-a1mipsm3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  },
  jwt: {
    secret: Deno.env.get("JWT_SECRET") || "your-super-secret-jwt-key-change-this-in-production",
    expiry: Deno.env.get("JWT_EXPIRY") || "7d",
  },
  server: {
    port: parseInt(Deno.env.get("PORT") || "8000"),
    corsOrigin: Deno.env.get("CORS_ORIGIN") || "http://localhost:3000",
  },
  gemini: {
    apiKey: Deno.env.get("GEMINI_API_KEY") || "",
  },
};
