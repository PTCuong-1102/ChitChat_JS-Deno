# Tài liệu Kỹ thuật ChitChatApp
## Kiến trúc Deno Backend + Next.js Frontend

| Hạng mục | Chi tiết |
|----------|----------|
| **Tiêu đề** | Tài liệu Phát triển Kỹ thuật ChitChatApp |
| **Phiên bản** | 4.0 (Deno + Next.js Architecture) |
| **Ngày** | 4 tháng 7, 2025 |
| **Trạng thái** | Mới (New) |
| **Tác giả** | Dựa trên yêu cầu tách kiến trúc Backend/Frontend |

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Kiến trúc Hệ thống](#2-kiến-trúc-hệ-thống)
3. [Cấu trúc Dự án](#3-cấu-trúc-dự-án)
4. [Database Design (Neon PostgreSQL)](#4-database-design-neon-postgresql)
5. [Deno Backend](#5-deno-backend)
6. [Next.js Frontend](#6-nextjs-frontend)
7. [API Specification](#7-api-specification)
8. [WebSocket Real-time](#8-websocket-real-time)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Deployment & DevOps](#10-deployment--devops)
11. [Development Setup](#11-development-setup)

---

## 1. Giới thiệu

### 1.1. Mục đích
Tài liệu này mô tả kiến trúc kỹ thuật cho dự án ChitChatApp với:
- **Backend**: Deno runtime với Oak framework
- **Frontend**: Next.js 14+ (chỉ client-side rendering)
- **Database**: Neon PostgreSQL
- **Real-time**: Native WebSocket

### 1.2. Lợi ích của kiến trúc mới
- **Performance**: Deno runtime nhanh, TypeScript native
- **Security**: Permission-based security model của Deno
- **Scalability**: Backend/Frontend độc lập, dễ scale
- **Modern Stack**: ES modules, top-level await, no node_modules

### 1.3. Tech Stack Overview

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14+, React 18+, Tailwind CSS | UI/UX, Client-side rendering |
| **Backend** | Deno 1.40+, Oak Framework | REST API, Business logic |
| **Database** | Neon PostgreSQL, Prisma ORM | Data persistence |
| **Real-time** | Native WebSocket (Deno) | Chat messaging |
| **Auth** | JWT (jose library) | Authentication |
| **Deployment** | Deno Deploy, Vercel | Cloud hosting |

---

## 2. Kiến trúc Hệ thống

### 2.1. High-level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile Browser]
    end
    
    subgraph "Frontend (Vercel)"
        C[Next.js App]
        C1[React Components]
        C2[Tailwind CSS]
    end
    
    subgraph "Backend (Deno Deploy)"
        D[Deno Runtime]
        D1[Oak Framework]
        D2[REST API]
        D3[WebSocket Server]
        D4[JWT Auth]
    end
    
    subgraph "Data Layer"
        E[Neon PostgreSQL]
        F[Prisma ORM]
        G[Redis Cache - Optional]
    end
    
    A --> C
    B --> C
    C --> D2
    C --> D3
    D1 --> D2
    D1 --> D3
    D2 --> F
    D3 --> F
    F --> E
    D2 --> G
```

### 2.2. Component Diagram

```mermaid
graph LR
    subgraph "Frontend Components"
        UI[UI Components]
        State[State Management]
        API[API Client]
        WS[WebSocket Client]
    end
    
    subgraph "Backend Services"
        Auth[Auth Service]
        User[User Service]
        Chat[Chat Service]
        File[File Service]
    end
    
    subgraph "Middleware"
        CORS[CORS]
        JWT[JWT Verify]
        Logger[Logger]
        RateLimit[Rate Limiter]
    end
    
    UI --> State
    State --> API
    State --> WS
    API --> CORS
    WS --> CORS
    CORS --> JWT
    JWT --> Auth
    JWT --> User
    JWT --> Chat
    JWT --> File
```

---

## 3. Cấu trúc Dự án

### 3.1. Monorepo Structure

```
chitchat-app/
├── /backend/                 # Deno Backend
│   ├── /src/
│   │   ├── /controllers/    # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── chat.controller.ts
│   │   │   └── message.controller.ts
│   │   ├── /services/       # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── chat.service.ts
│   │   │   └── websocket.service.ts
│   │   ├── /middleware/     # Middleware functions
│   │   │   ├── auth.middleware.ts
│   │   │   ├── cors.middleware.ts
│   │   │   ├── logger.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   ├── /models/         # Data models
│   │   │   ├── user.model.ts
│   │   │   ├── message.model.ts
│   │   │   └── room.model.ts
│   │   ├── /routes/         # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── chat.routes.ts
│   │   │   └── index.ts
│   │   ├── /utils/          # Utility functions
│   │   │   ├── jwt.util.ts
│   │   │   ├── hash.util.ts
│   │   │   └── validator.util.ts
│   │   ├── /types/          # TypeScript types
│   │   │   └── index.d.ts
│   │   └── /config/         # Configuration
│   │       ├── database.ts
│   │       └── env.ts
│   ├── /prisma/
│   │   └── schema.prisma    # Prisma schema
│   ├── main.ts              # Entry point
│   ├── deno.json            # Deno configuration
│   └── import_map.json      # Import mappings
│
├── /frontend/               # Next.js Frontend
│   ├── /app/               # App Router
│   │   ├── /(auth)/        # Auth pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── /(main)/        # Main app
│   │   │   ├── chat/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── /api/           # API proxy (optional)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── /components/        # React components
│   │   ├── /ui/           # UI components
│   │   ├── /chat/         # Chat components
│   │   └── /shared/       # Shared components
│   ├── /lib/              # Libraries
│   │   ├── api-client.ts  # API client
│   │   ├── websocket.ts   # WebSocket client
│   │   └── utils.ts
│   ├── /hooks/            # Custom hooks
│   ├── /store/            # State management
│   ├── /types/            # TypeScript types
│   ├── package.json
│   └── next.config.js
│
├── /shared/               # Shared types/utils
│   └── /types/
│       └── index.ts
│
├── docker-compose.yml     # Local development
├── .gitignore
└── README.md
```

---

## 4. Database Design (Neon PostgreSQL)

### 4.1. Connection Configuration

```typescript
// backend/src/config/database.ts
export const DATABASE_URL = "postgresql://neondb_owner:npg_sFid7Gfq8DcS@ep-empty-snowflake-a1mipsm3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
```

### 4.2. Entity Relationship Diagram

```mermaid
erDiagram
    auth_users ||--|| users : "has profile"
    users ||--o{ messages : "sends"
    users ||--o{ room_participants : "participates"
    users ||--o{ user_contacts : "has contacts"
    users ||--o{ blocked_users : "blocks"
    users ||--o{ bot : "creates"
    users ||--o{ bot_chat : "chats with bot"
    chat_rooms ||--o{ messages : "contains"
    chat_rooms ||--o{ room_participants : "has participants"
    chat_rooms ||--o{ user_role : "has roles"
    messages ||--o{ attachments : "has attachments"
    messages ||--o{ message_status : "has status"
    bot ||--o{ bot_chat : "handles chat"
```

### 4.3. Key Tables

1. **auth_users**: Authentication data
2. **users**: User profiles
3. **chat_rooms**: Chat rooms (private/group)
4. **messages**: All messages
5. **room_participants**: Room membership
6. **attachments**: File attachments
7. **message_status**: Read receipts
8. **user_contacts**: Friend lists
9. **blocked_users**: Block lists
10. **bot**: Bot configurations
11. **bot_chat**: Bot conversations
12. **user_role**: Room roles (admin/member)

---

## 5. Deno Backend

### 5.1. Main Application Setup

```typescript
// backend/main.ts
import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { router } from "./src/routes/index.ts";
import { errorHandler } from "./src/middleware/error.middleware.ts";
import { logger } from "./src/middleware/logger.middleware.ts";
import { initWebSocket } from "./src/services/websocket.service.ts";

const app = new Application();

// Middleware
app.use(logger);
app.use(errorHandler);
app.use(oakCors({
  origin: ["http://localhost:3000", "https://your-frontend.vercel.app"],
  credentials: true,
}));

// Routes
app.use(router.routes());
app.use(router.allowedMethods());

// Start server
const port = parseInt(Deno.env.get("PORT") || "8000");
console.log(`Server running on port ${port}`);

// Initialize WebSocket server
const server = await app.listen({ port });
initWebSocket(server);
```

### 5.2. Deno Configuration

```json
// backend/deno.json
{
  "tasks": {
    "dev": "deno run --allow-net --allow-env --allow-read --watch main.ts",
    "start": "deno run --allow-net --allow-env --allow-read main.ts",
    "prisma": "deno run -A npm:prisma",
    "db:pull": "deno task prisma db pull",
    "db:push": "deno task prisma db push",
    "db:generate": "deno task prisma generate --data-proxy"
  },
  "imports": {
    "@/": "./src/",
    "oak": "https://deno.land/x/oak@v12.6.1/mod.ts",
    "cors": "https://deno.land/x/cors@v1.2.2/mod.ts",
    "bcrypt": "https://deno.land/x/bcrypt@v0.4.1/mod.ts",
    "jose": "https://deno.land/x/jose@v5.2.0/index.ts",
    "zod": "https://deno.land/x/zod@v3.22.4/mod.ts"
  },
  "compilerOptions": {
    "allowJs": true,
    "strict": true
  }
}
```

### 5.3. Authentication Service

```typescript
// backend/src/services/auth.service.ts
import { hash, compare } from "bcrypt";
import { create, verify } from "jose";
import { PrismaClient } from "../generated/client/deno/index.d.ts";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schemas
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  userName: z.string().min(3).max(20),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthService {
  private static jwtSecret = new TextEncoder().encode(
    Deno.env.get("JWT_SECRET") || "your-secret-key"
  );

  static async register(data: z.infer<typeof RegisterSchema>) {
    // Check if user exists
    const existingUser = await prisma.auth_users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const passwordHash = await hash(data.password);

    // Create auth user and profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      const authUser = await tx.auth_users.create({
        data: {
          email: data.email,
          password_hash: passwordHash,
        },
      });

      const user = await tx.users.create({
        data: {
          id: authUser.id,
          email: data.email,
          full_name: data.fullName,
          user_name: data.userName,
        },
      });

      return user;
    });

    // Generate JWT
    const token = await this.generateToken(result.id);

    return { user: result, token };
  }

  static async login(data: z.infer<typeof LoginSchema>) {
    const authUser = await prisma.auth_users.findUnique({
      where: { email: data.email },
      include: { users: true },
    });

    if (!authUser || !authUser.password_hash) {
      throw new Error("Invalid credentials");
    }

    const validPassword = await compare(data.password, authUser.password_hash);
    if (!validPassword) {
      throw new Error("Invalid credentials");
    }

    const token = await this.generateToken(authUser.id);

    return { user: authUser.users, token };
  }

  static async generateToken(userId: string) {
    const jwt = await create(
      { alg: "HS256" },
      {
        sub: userId,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
      },
      this.jwtSecret
    );

    return jwt;
  }

  static async verifyToken(token: string) {
    try {
      const { payload } = await verify(token, this.jwtSecret);
      return payload.sub as string;
    } catch {
      throw new Error("Invalid token");
    }
  }
}
```

### 5.4. WebSocket Service

```typescript
// backend/src/services/websocket.service.ts
import { WebSocket, WebSocketServer } from "https://deno.land/std@0.208.0/ws/mod.ts";
import { AuthService } from "./auth.service.ts";

interface WSClient {
  socket: WebSocket;
  userId: string;
  rooms: Set<string>;
}

export class WebSocketService {
  private static clients = new Map<string, WSClient>();
  private static rooms = new Map<string, Set<string>>();

  static async handleConnection(socket: WebSocket, token: string) {
    try {
      // Verify JWT token
      const userId = await AuthService.verifyToken(token);
      
      // Store client
      const client: WSClient = {
        socket,
        userId,
        rooms: new Set(),
      };
      
      this.clients.set(userId, client);
      
      // Handle messages
      for await (const event of socket) {
        if (typeof event === "string") {
          await this.handleMessage(userId, JSON.parse(event));
        }
      }
      
    } catch (error) {
      socket.close(1008, "Invalid token");
    } finally {
      // Cleanup on disconnect
      this.handleDisconnect(userId);
    }
  }

  static async handleMessage(userId: string, message: any) {
    const client = this.clients.get(userId);
    if (!client) return;

    switch (message.type) {
      case "join_room":
        await this.joinRoom(userId, message.roomId);
        break;
        
      case "leave_room":
        await this.leaveRoom(userId, message.roomId);
        break;
        
      case "send_message":
        await this.sendMessage(userId, message);
        break;
        
      case "typing":
        await this.broadcastTyping(userId, message.roomId);
        break;
    }
  }

  static async joinRoom(userId: string, roomId: string) {
    const client = this.clients.get(userId);
    if (!client) return;

    // Add user to room
    client.rooms.add(roomId);
    
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(userId);

    // Notify room members
    this.broadcastToRoom(roomId, {
      type: "user_joined",
      userId,
      roomId,
    }, userId);
  }

  static async sendMessage(userId: string, message: any) {
    // Save to database first
    const savedMessage = await MessageService.create({
      roomId: message.roomId,
      senderId: userId,
      content: message.content,
      messageType: message.messageType || "text",
    });

    // Broadcast to room
    this.broadcastToRoom(message.roomId, {
      type: "new_message",
      message: savedMessage,
    });
  }

  static broadcastToRoom(roomId: string, data: any, excludeUserId?: string) {
    const roomUsers = this.rooms.get(roomId);
    if (!roomUsers) return;

    for (const userId of roomUsers) {
      if (userId === excludeUserId) continue;
      
      const client = this.clients.get(userId);
      if (client && client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(JSON.stringify(data));
      }
    }
  }

  static handleDisconnect(userId: string) {
    const client = this.clients.get(userId);
    if (!client) return;

    // Remove from all rooms
    for (const roomId of client.rooms) {
      this.leaveRoom(userId, roomId);
    }

    // Remove client
    this.clients.delete(userId);
  }
}

export function initWebSocket(server: Deno.Listener) {
  const wss = new WebSocketServer(server);
  
  wss.on("connection", async (ws: WebSocket, req: Request) => {
    const token = new URL(req.url).searchParams.get("token");
    if (!token) {
      ws.close(1008, "Missing token");
      return;
    }
    
    await WebSocketService.handleConnection(ws, token);
  });
}
```

---

## 6. Next.js Frontend

### 6.1. API Client Setup

```typescript
// frontend/lib/api-client.ts
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (data: LoginData) => apiClient.post("/api/auth/login", data),
  register: (data: RegisterData) => apiClient.post("/api/auth/register", data),
  me: () => apiClient.get("/api/auth/me"),
};

export const chatAPI = {
  getRooms: () => apiClient.get("/api/chat/rooms"),
  getMessages: (roomId: string) => apiClient.get(`/api/chat/rooms/${roomId}/messages`),
  sendMessage: (roomId: string, data: any) => 
    apiClient.post(`/api/chat/rooms/${roomId}/messages`, data),
};
```

### 6.2. WebSocket Client

```typescript
// frontend/lib/websocket.ts
import { create } from "zustand";

interface WebSocketStore {
  socket: WebSocket | null;
  isConnected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export const useWebSocket = create<WebSocketStore>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (token: string) => {
    const socket = new WebSocket(`${WS_URL}?token=${token}`);

    socket.onopen = () => {
      set({ socket, isConnected: true });
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    socket.onclose = () => {
      set({ socket: null, isConnected: false });
      // Reconnect after 3 seconds
      setTimeout(() => {
        const token = localStorage.getItem("token");
        if (token) get().connect(token);
      }, 3000);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },

  sendMessage: (message: any) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  },
}));

function handleWebSocketMessage(data: any) {
  switch (data.type) {
    case "new_message":
      // Update messages store
      useMessagesStore.getState().addMessage(data.message);
      break;
      
    case "user_joined":
      // Update room participants
      break;
      
    case "typing":
      // Show typing indicator
      break;
  }
}
```

### 6.3. Chat Component

```tsx
// frontend/components/chat/ChatWindow.tsx
"use client";

import { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/websocket";
import { chatAPI } from "@/lib/api-client";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface ChatWindowProps {
  roomId: string;
}

export default function ChatWindow({ roomId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { sendMessage, isConnected } = useWebSocket();

  useEffect(() => {
    loadMessages();
    joinRoom();
  }, [roomId]);

  const loadMessages = async () => {
    try {
      const { data } = await chatAPI.getMessages(roomId);
      setMessages(data);
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = () => {
    sendMessage({
      type: "join_room",
      roomId,
    });
  };

  const handleSendMessage = async (content: string) => {
    try {
      // Send via API first
      const { data } = await chatAPI.sendMessage(roomId, {
        content,
        messageType: "text",
      });

      // Optimistically add to UI
      setMessages((prev) => [...prev, data]);

      // Notify via WebSocket
      sendMessage({
        type: "send_message",
        roomId,
        content,
        messageType: "text",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (loading) {
    return <div>Loading messages...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Chat Room</h2>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-500">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      <MessageList messages={messages} />
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}
```

---

## 7. API Specification

### 7.1. Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/register` | Register new user | `{ email, password, fullName, userName }` | `{ user, token }` |
| POST | `/api/auth/login` | Login user | `{ email, password }` | `{ user, token }` |
| GET | `/api/auth/me` | Get current user | - | `{ user }` |
| POST | `/api/auth/logout` | Logout user | - | `{ success }` |
| POST | `/api/auth/refresh` | Refresh token | - | `{ token }` |

### 7.2. User Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/users` | List users | - | `{ users[] }` |
| GET | `/api/users/:id` | Get user by ID | - | `{ user }` |
| PUT | `/api/users/:id` | Update user | `{ fullName, avatar, etc }` | `{ user }` |
| DELETE | `/api/users/:id` | Delete user | - | `{ success }` |
| GET | `/api/users/:id/contacts` | Get user contacts | - | `{ contacts[] }` |
| POST | `/api/users/:id/contacts` | Add contact | `{ friendId }` | `{ contact }` |

### 7.3. Chat Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/chat/rooms` | List chat rooms | - | `{ rooms[] }` |
| POST | `/api/chat/rooms` | Create room | `{ name, isGroup, participants }` | `{ room }` |
| GET | `/api/chat/rooms/:id` | Get room details | - | `{ room }` |
| PUT | `/api/chat/rooms/:id` | Update room | `{ name }` | `{ room }` |
| DELETE | `/api/chat/rooms/:id` | Delete room | - | `{ success }` |
| GET | `/api/chat/rooms/:id/messages` | Get messages | `?limit=50&offset=0` | `{ messages[] }` |
| POST | `/api/chat/rooms/:id/messages` | Send message | `{ content, messageType }` | `{ message }` |
| GET | `/api/chat/rooms/:id/participants` | Get participants | - | `{ participants[] }` |
| POST | `/api/chat/rooms/:id/participants` | Add participant | `{ userId }` | `{ participant }` |

---

## 8. WebSocket Real-time

### 8.1. WebSocket Events

#### Client to Server Events

| Event | Description | Payload |
|-------|-------------|---------|
| `join_room` | Join a chat room | `{ roomId }` |
| `leave_room` | Leave a chat room | `{ roomId }` |
| `send_message` | Send a message | `{ roomId, content, messageType }` |
| `typing` | User is typing | `{ roomId }` |
| `stop_typing` | User stopped typing | `{ roomId }` |
| `mark_read` | Mark message as read | `{ messageId }` |

#### Server to Client Events

| Event | Description | Payload |
|-------|-------------|---------|
| `new_message` | New message received | `{ message }` |
| `user_joined` | User joined room | `{ userId, roomId }` |
| `user_left` | User left room | `{ userId, roomId }` |
| `typing_indicator` | Someone is typing | `{ userId, roomId }` |
| `message_status` | Message status update | `{ messageId, status }` |
| `error` | Error occurred | `{ message, code }` |

### 8.2. Connection Flow

```mermaid
sequenceDiagram
    participant Client
    participant WebSocket
    participant Auth
    participant Rooms
    
    Client->>WebSocket: Connect with token
    WebSocket->>Auth: Verify token
    Auth-->>WebSocket: User ID
    WebSocket->>Client: Connected
    
    Client->>WebSocket: join_room
    WebSocket->>Rooms: Add user to room
    WebSocket->>Client: Room joined
    
    Client->>WebSocket: send_message
    WebSocket->>Rooms: Broadcast to room
    Rooms->>Client: new_message event
```

---

## 9. Authentication & Authorization

### 9.1. JWT Token Structure

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### 9.2. Authorization Middleware

```typescript
// backend/src/middleware/auth.middleware.ts
import { Context, Next } from "oak";
import { AuthService } from "../services/auth.service.ts";

export async function authMiddleware(ctx: Context, next: Next) {
  const authHeader = ctx.request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Unauthorized" };
    return;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const userId = await AuthService.verifyToken(token);
    ctx.state.userId = userId;
    await next();
  } catch {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid token" };
  }
}
```

### 9.3. Role-based Access Control

```typescript
// backend/src/middleware/rbac.middleware.ts
export function requireRole(role: string) {
  return async (ctx: Context, next: Next) => {
    const userId = ctx.state.userId;
    const roomId = ctx.params.roomId;
    
    const userRole = await UserRoleService.getUserRole(userId, roomId);
    
    if (userRole?.role !== role) {
      ctx.response.status = 403;
      ctx.response.body = { error: "Forbidden" };
      return;
    }
    
    await next();
  };
}
```

---

## 10. Deployment & DevOps

### 10.1. Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://neondb_owner:npg_sFid7Gfq8DcS@ep-empty-snowflake-a1mipsm3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Auth
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRY="7d"

# Server
PORT=8000
CORS_ORIGIN="https://your-frontend.vercel.app"

# File Storage (optional)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="ap-southeast-1"
S3_BUCKET="chitchat-uploads"
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL="https://your-backend.deno.dev"
NEXT_PUBLIC_WS_URL="wss://your-backend.deno.dev"
```

### 10.2. Docker Configuration

```dockerfile
# backend/Dockerfile
FROM denoland/deno:1.40.0

WORKDIR /app

# Cache dependencies
COPY deno.json import_map.json ./
RUN deno cache --import-map=import_map.json main.ts

# Copy source
COPY . .

# Generate Prisma client
RUN deno task db:generate

EXPOSE 8000

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "main.ts"]
```

### 10.3. docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
      - NEXT_PUBLIC_WS_URL=ws://localhost:8000
    depends_on:
      - backend

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### 10.4. Deployment Steps

#### Backend (Deno Deploy)
```bash
# Install Deno Deploy CLI
deno install --allow-all --no-check -r -f https://deno.land/x/deploy/deployctl.ts

# Deploy
cd backend
deployctl deploy --project=chitchat-backend main.ts
```

#### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

---

## 11. Development Setup

### 11.1. Prerequisites

- Deno 1.40+ installed
- Node.js 18+ installed
- PostgreSQL client (for database management)
- Git

### 11.2. Backend Setup

```bash
# Clone repository
git clone https://github.com/your-repo/chitchat-app.git
cd chitchat-app/backend

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Install Prisma CLI
deno task prisma

# Pull database schema
deno task db:pull

# Generate Prisma client
deno task db:generate

# Run development server
deno task dev
```

### 11.3. Frontend Setup

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Edit .env.local with backend URL

# Run development server
npm run dev
```

### 11.4. Testing

#### Backend Testing
```bash
# Run tests
deno test --allow-all

# Run with coverage
deno test --allow-all --coverage=coverage
```

#### Frontend Testing
```bash
# Run tests
npm test

# Run e2e tests
npm run test:e2e
```

### 11.5. Common Commands

```bash
# Backend
deno task dev          # Start dev server
deno task start        # Start production server
deno task db:pull      # Pull schema from database
deno task db:push      # Push schema to database
deno task db:generate  # Generate Prisma client

# Frontend
npm run dev           # Start dev server
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run linter
npm run test          # Run tests
```

---

## Phụ lục

### A. Troubleshooting

1. **CORS Issues**
   - Ensure backend CORS configuration includes frontend URL
   - Check WebSocket connection uses correct protocol (ws/wss)

2. **Database Connection**
   - Verify DATABASE_URL is correct
   - Check SSL mode is set to "require"
   - Ensure IP is whitelisted in Neon console

3. **WebSocket Disconnections**
   - Implement reconnection logic
   - Handle network interruptions gracefully
   - Use heartbeat/ping-pong mechanism

### B. Performance Optimization

1. **Database**
   - Use connection pooling
   - Implement query caching with Redis
   - Optimize indexes for common queries

2. **WebSocket**
   - Implement message batching
   - Use binary protocol for large data
   - Limit concurrent connections per user

3. **Frontend**
   - Implement virtual scrolling for message lists
   - Use React.memo for expensive components
   - Lazy load routes and components

### C. Security Best Practices

1. **Authentication**
   - Use strong JWT secrets
   - Implement refresh token rotation
   - Add rate limiting on auth endpoints

2. **Data Validation**
   - Validate all input with Zod
   - Sanitize user-generated content
   - Implement SQL injection prevention

3. **File Uploads**
   - Limit file sizes
   - Validate file types
   - Scan for malware
   - Use signed URLs for direct uploads

### D. Monitoring & Logging

```typescript
// backend/src/utils/logger.ts
import { log } from "https://deno.land/std@0.208.0/log/mod.ts";

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG"),
    file: new log.handlers.FileHandler("INFO", {
      filename: "./logs/app.log",
      formatter: "{datetime} {levelName} {msg}",
    }),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console", "file"],
    },
  },
});

export const logger = log.getLogger();
```

---
### E.SQL NEON Database
-- Neon Database Schema for Chat Application
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create auth_users table to replace Supabase's auth.users
CREATE TABLE IF NOT EXISTS public.auth_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT auth_users_pkey PRIMARY KEY (id)
);

-- Add password_hash column for authentication
ALTER TABLE public.auth_users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS attachments_id_seq;
CREATE SEQUENCE IF NOT EXISTS blocked_users_id_seq;
CREATE SEQUENCE IF NOT EXISTS bot_id_seq;
CREATE SEQUENCE IF NOT EXISTS bot_chat_id_seq;
CREATE SEQUENCE IF NOT EXISTS messagestatus_id_seq;
CREATE SEQUENCE IF NOT EXISTS messages_id_seq;
CREATE SEQUENCE IF NOT EXISTS room_participants_id_seq;
CREATE SEQUENCE IF NOT EXISTS user_contacts_id_seq;
CREATE SEQUENCE IF NOT EXISTS user_role_id_seq;

-- Create users table (modified to reference local auth_users)
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  user_name text NOT NULL UNIQUE,
  avatar_url text,
  status boolean NOT NULL DEFAULT true,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES public.auth_users(id) ON DELETE CASCADE
);

-- Create chat_rooms table
CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  is_group boolean NOT NULL DEFAULT false,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  CONSTRAINT chat_rooms_pkey PRIMARY KEY (id)
);

-- Create messages table
CREATE TABLE public.messages (
  id bigint NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
  room_id uuid,
  sender_id uuid,
  content text NOT NULL,
  message_type text NOT NULL CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text, 'system'::text])),
  sent_at timestamp without time zone NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE
);

-- Create attachments table
CREATE TABLE public.attachments (
  id integer NOT NULL DEFAULT nextval('attachments_id_seq'::regclass),
  message_id integer NOT NULL,
  file_url text NOT NULL,
  file_type character varying(50) NOT NULL,
  file_size integer NOT NULL,
  uploaded_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT attachments_pkey PRIMARY KEY (id),
  CONSTRAINT attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE
);

-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id integer NOT NULL DEFAULT nextval('blocked_users_id_seq'::regclass),
  user_id uuid NOT NULL,
  blocked_user_id uuid NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT blocked_users_pkey PRIMARY KEY (id),
  CONSTRAINT blocked_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT blocked_users_blocked_user_id_fkey FOREIGN KEY (blocked_user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT blocked_users_unique UNIQUE (user_id, blocked_user_id)
);

-- Create bot table
CREATE TABLE public.bot (
  id integer NOT NULL DEFAULT nextval('bot_id_seq'::regclass),
  bot_name character varying(100),
  user_id uuid NOT NULL,
  bot_api character varying(255),
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT bot_pkey PRIMARY KEY (id),
  CONSTRAINT bot_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create bot_chat table
CREATE TABLE public.bot_chat (
  id integer NOT NULL DEFAULT nextval('bot_chat_id_seq'::regclass),
  bot_id integer NOT NULL,
  user_id uuid NOT NULL,
  content text,
  status character varying(50) NOT NULL DEFAULT 'pending',
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT bot_chat_pkey PRIMARY KEY (id),
  CONSTRAINT bot_chat_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT bot_chat_bot_id_fkey FOREIGN KEY (bot_id) REFERENCES public.bot(id) ON DELETE CASCADE
);

-- Create message_status table
CREATE TABLE public.message_status (
  id integer NOT NULL DEFAULT nextval('messagestatus_id_seq'::regclass),
  message_id integer NOT NULL,
  receiver_id uuid NOT NULL,
  status character varying(50) NOT NULL DEFAULT 'sent',
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT message_status_pkey PRIMARY KEY (id),
  CONSTRAINT message_status_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT message_status_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE,
  CONSTRAINT message_status_unique UNIQUE (message_id, receiver_id)
);

-- Create room_participants table
CREATE TABLE public.room_participants (
  id bigint NOT NULL DEFAULT nextval('room_participants_id_seq'::regclass),
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp without time zone DEFAULT now(),
  CONSTRAINT room_participants_pkey PRIMARY KEY (id),
  CONSTRAINT room_participants_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  CONSTRAINT room_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT room_participants_unique UNIQUE (room_id, user_id)
);

-- Create user_contacts table
CREATE TABLE public.user_contacts (
  id integer NOT NULL DEFAULT nextval('user_contacts_id_seq'::regclass),
  user_id uuid NOT NULL,
  friend_id uuid NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_contacts_pkey PRIMARY KEY (id),
  CONSTRAINT user_contacts_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT user_contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT user_contacts_unique UNIQUE (user_id, friend_id)
);

-- Create user_role table
CREATE TABLE public.user_role (
  id integer NOT NULL DEFAULT nextval('user_role_id_seq'::regclass),
  user_id uuid NOT NULL,
  chat_rooms_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  CONSTRAINT user_role_pkey PRIMARY KEY (id),
  CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT user_role_chat_rooms_id_fkey FOREIGN KEY (chat_rooms_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  CONSTRAINT user_role_unique UNIQUE (user_id, chat_rooms_id)
);

-- Create indexes for better performance
CREATE INDEX idx_messages_room_id ON public.messages(room_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_sent_at ON public.messages(sent_at DESC);
CREATE INDEX idx_attachments_message_id ON public.attachments(message_id);
CREATE INDEX idx_room_participants_room_id ON public.room_participants(room_id);
CREATE INDEX idx_room_participants_user_id ON public.room_participants(user_id);
CREATE INDEX idx_message_status_message_id ON public.message_status(message_id);
CREATE INDEX idx_message_status_receiver_id ON public.message_status(receiver_id);
CREATE INDEX idx_user_contacts_user_id ON public.user_contacts(user_id);
CREATE INDEX idx_user_contacts_friend_id ON public.user_contacts(friend_id);
CREATE INDEX idx_bot_user_id ON public.bot(user_id);
CREATE INDEX idx_bot_chat_bot_id ON public.bot_chat(bot_id);
CREATE INDEX idx_bot_chat_user_id ON public.bot_chat(user_id);

-- Add comments for documentation
COMMENT ON TABLE public.auth_users IS 'Authentication users table with email and password hash';
COMMENT ON COLUMN public.auth_users.password_hash IS 'Hashed password using bcrypt or similar secure hashing algorithm';
COMMENT ON TABLE public.users IS 'Main users table storing user profiles';
COMMENT ON TABLE public.chat_rooms IS 'Chat rooms for both private and group conversations';
COMMENT ON TABLE public.messages IS 'All messages sent in chat rooms';
COMMENT ON TABLE public.attachments IS 'File attachments for messages';
COMMENT ON TABLE public.room_participants IS 'Users participating in each chat room';
COMMENT ON TABLE public.message_status IS 'Read/delivery status for each message per receiver';
COMMENT ON TABLE public.user_contacts IS 'User contact/friend relationships';
COMMENT ON TABLE public.blocked_users IS 'Users blocked by other users';
COMMENT ON TABLE public.bot IS 'Bot configurations created by users';
COMMENT ON TABLE public.bot_chat IS 'Chat history with bots';
COMMENT ON TABLE public.user_role IS 'User roles within chat rooms (admin, member, etc.)';

**End of Document**