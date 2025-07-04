import { oakCors } from "cors";
import { config } from "@/config/env.ts";

export const corsMiddleware = oakCors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
});
