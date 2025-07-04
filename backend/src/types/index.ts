// Database entity types
export interface AuthUser {
  id: string;
  email: string;
  password_hash?: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  user_name: string;
  avatar_url?: string;
  status: boolean;
}

export interface ChatRoom {
  id: string;
  name?: string;
  is_group: boolean;
  created_at: Date;
  is_deleted: boolean;
}

export interface Message {
  id: number;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  sent_at: Date;
  is_read: boolean;
}

export interface RoomParticipant {
  id: number;
  room_id: string;
  user_id: string;
  joined_at: Date;
}

export interface UserContact {
  id: number;
  user_id: string;
  friend_id: string;
  created_at: Date;
}

export interface BlockedUser {
  id: number;
  user_id: string;
  blocked_user_id: string;
  created_at: Date;
}

export interface Bot {
  id: number;
  bot_name: string;
  user_id: string;
  bot_api: string;
  created_at: Date;
}

export interface BotChat {
  id: number;
  bot_id: number;
  user_id: string;
  content: string;
  status: string;
  created_at: Date;
}

export interface UserRole {
  id: number;
  user_id: string;
  chat_rooms_id: string;
  role: string;
}

export interface MessageStatus {
  id: number;
  message_id: number;
  receiver_id: string;
  status: string;
  updated_at: Date;
}

export interface Attachment {
  id: number;
  message_id: number;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: Date;
}

// API Request/Response types
export interface RegisterRequest {
  fullName: string;
  userName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SendMessageRequest {
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'system';
}

export interface CreateBotRequest {
  name: string;
  model: string;
  apiKey: string;
  description: string;
}

export interface BotQueryRequest {
  prompt: string;
}

export interface BotQueryResponse {
  response: string;
}

// WebSocket message types
export interface WSMessage {
  type: string;
  payload: any;
}

export interface JoinRoomMessage {
  type: 'join_room';
  chatId: string;
}

export interface LeaveRoomMessage {
  type: 'leave_room';
  chatId: string;
}

export interface TypingMessage {
  type: 'typing';
  chatId: string;
  isTyping: boolean;
}

export interface NewMessageEvent {
  type: 'new_message';
  message: Message;
}

export interface UserStatusUpdateEvent {
  type: 'user_status_update';
  userId: string;
  status: 'online' | 'offline';
}

export interface TypingIndicatorEvent {
  type: 'typing_indicator';
  chatId: string;
  user: {
    id: string;
    name: string;
  };
}

export interface NotificationEvent {
  type: 'notification';
  id: string;
  message: string;
  avatar: string;
}

// Context types for Oak middleware
export interface AuthContext {
  userId: string;
  user?: User;
}
