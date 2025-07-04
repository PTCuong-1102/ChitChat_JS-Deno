
export interface User {
  id: string;
  name: string;
  avatar: string;
  status?: 'online' | 'offline' | 'away';
  activity?: string;
  email?: string;
  username?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface Chat {
  id:string;
  isGroup: boolean;
  name?: string; // For group chats
  participants: string[]; // Array of user IDs
  lastMessage?: string; // Preview of last message
  lastMessageTimestamp?: string;
  tag?: string;
}

export interface Bot {
  id: string;
  name: string;
  model: string;
  apiKey: string;
  description: string;
  avatar: string;
}