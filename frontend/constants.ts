// API Configuration
export const API_BASE_URL = 'http://127.0.0.1:8000'; // Use IPv4 specifically

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_ME: '/api/auth/me',
  AUTH_LOGOUT: '/api/auth/logout',
  
  // Data
  DATA_BOOTSTRAP: '/api/data/bootstrap',
  
  // Chat
  CHAT_ROOMS: '/api/chat/rooms',
  CHAT_MESSAGES: (roomId: string) => `/api/chat/rooms/${roomId}/messages`,
  CHAT_SEND_MESSAGE: (roomId: string) => `/api/chat/rooms/${roomId}/messages`,
  
  // Users
  USERS_SEARCH: '/api/users/search',
  USERS_CONTACTS: '/api/users/contacts',
  USERS_PROFILE: '/api/users/me',
  
  // Upload
  UPLOAD_PROFILE: '/api/upload/profile',
  UPLOAD_CHAT: '/api/upload/chat',
  UPLOAD_DELETE: '/api/upload/delete',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'chitchat_auth_token',
  USER_DATA: 'chitchat_user_data',
};
