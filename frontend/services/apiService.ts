import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '../constants.ts';

// Helper function to transform backend user data to frontend format
function transformUserData(backendUser: any): any {
  if (!backendUser) return null;
  
  // Choose the best avatar URL (prefer avatar_url, fall back to avatar)
  let avatarUrl = backendUser.avatar_url || backendUser.avatar || null;
  
  console.log('🧮 transformUserData processing:', {
    input: backendUser,
    avatarUrl_field: backendUser.avatar_url,
    avatar_field: backendUser.avatar,
    chosen_avatar: avatarUrl
  });
  
  const transformed = {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.full_name || backendUser.name,
    username: backendUser.user_name || backendUser.username,
    avatar: avatarUrl,
    status: backendUser.status,
    // Keep original fields as well for compatibility
    full_name: backendUser.full_name,
    user_name: backendUser.user_name,
    avatar_url: backendUser.avatar_url,
  };
  
  console.log('🧮 transformUserData result:', transformed);
  return transformed;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    console.log('🔧 API Service initialized:');
    console.log('  Base URL:', this.baseUrl);
    console.log('  Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
  }

  // Get auth token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // Set auth token in localStorage
  private setAuthToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  // Remove auth token
  private removeAuthToken(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Generic API request method
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAuthToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('🌐 API Request:', {
      method: config.method || 'GET',
      url,
      hasToken: !!token,
    });

    try {
      const response = await fetch(url, config);
      
      console.log('📡 API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.removeAuthToken();
          throw new Error('Authentication failed. Please login again.');
        }
        
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ API Error Details:');
      console.error('  URL:', url);
      console.error('  Method:', config.method || 'GET');
      console.error('  Error Type:', error.name);
      console.error('  Error Message:', error.message);
      console.error('  Full Error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running on ' + this.baseUrl);
      }
      
      throw error;
    }
  }

  // Auth API methods
  async register(userData: {
    fullName: string;
    userName: string;
    email: string;
    password: string;
  }) {
    const response = await this.request<{user: any, token: string}>(
      API_ENDPOINTS.AUTH_REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );

    this.setAuthToken(response.token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
    return response;
  }

  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{user: any, token: string}>(
      API_ENDPOINTS.AUTH_LOGIN,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    this.setAuthToken(response.token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
    return response;
  }

  async getCurrentUser() {
    return this.request(API_ENDPOINTS.AUTH_ME);
  }

  // Data API methods
  async getBootstrapData() {
    return this.request(API_ENDPOINTS.DATA_BOOTSTRAP);
  }

  // Chat API methods
  async getUserChats() {
    return this.request(API_ENDPOINTS.CHAT_ROOMS);
  }

  async getChatMessages(roomId: string) {
    return this.request(API_ENDPOINTS.CHAT_MESSAGES(roomId));
  }

  async sendMessage(roomId: string, content: string) {
    return this.request(API_ENDPOINTS.CHAT_SEND_MESSAGE(roomId), {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // User API methods
  async searchUsers(query: string) {
    return this.request(`${API_ENDPOINTS.USERS_SEARCH}?q=${encodeURIComponent(query)}`);
  }

  async getUserContacts() {
    return this.request(API_ENDPOINTS.USERS_CONTACTS);
  }

  // Upload API methods
  async uploadProfileImage(file: File): Promise<{imageUrl: string, user: any}> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const token = this.getAuthToken();
    
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.UPLOAD_PROFILE}`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('📦 Raw upload response from backend:', data);
      
      // Ensure the imageUrl is a full URL
      if (data.imageUrl && !data.imageUrl.startsWith('http')) {
        data.imageUrl = `${this.baseUrl}${data.imageUrl}`;
        console.log('🔗 Converted imageUrl to full URL:', data.imageUrl);
      }
      
      // Update user avatar URL to be full URL as well BEFORE transformation
      if (data.user && data.user.avatar_url && !data.user.avatar_url.startsWith('http')) {
        data.user.avatar_url = `${this.baseUrl}${data.user.avatar_url}`;
        console.log('🔗 Converted user avatar_url to full URL:', data.user.avatar_url);
      }
      
      console.log('📝 User data before transformation:', data.user);
      
      // Transform user data to frontend format
      data.user = transformUserData(data.user);
      
      console.log('🔄 User data after transformation:', data.user);
      
      console.log('✅ Profile image uploaded:', data);
      return data;
    } catch (error) {
      console.error('❌ Profile image upload failed:', error);
      throw error;
    }
  }

  async uploadChatImage(file: File): Promise<{imageUrl: string}> {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = this.getAuthToken();
    
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.UPLOAD_CHAT}`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Ensure the imageUrl is a full URL
      if (data.imageUrl && !data.imageUrl.startsWith('http')) {
        data.imageUrl = `${this.baseUrl}${data.imageUrl}`;
      }
      
      console.log('✅ Chat image uploaded:', data);
      return data;
    } catch (error) {
      console.error('❌ Chat image upload failed:', error);
      throw error;
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    return this.request(API_ENDPOINTS.UPLOAD_DELETE, {
      method: 'DELETE',
      body: JSON.stringify({ imageUrl }),
    });
  }

  // User profile API methods
  async updateUserProfile(profileData: {
    name?: string;
    username?: string;
    email?: string;
    avatar?: string;
  }): Promise<{user: any}> {
    console.log('👤 updateUserProfile called with:', profileData);
    
    const response = await this.request<{user: any}>(API_ENDPOINTS.USERS_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    
    console.log('📝 Raw backend response:', response);
    
    // Transform user data to frontend format
    const originalUser = response.user;
    response.user = transformUserData(response.user);
    
    console.log('🔄 Transformed user data:', {
      original: originalUser,
      transformed: response.user
    });
    
    return response;
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    return this.request('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Logout API method
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint for audit logging
      if (this.getAuthToken()) {
        await this.request(API_ENDPOINTS.AUTH_LOGOUT, {
          method: 'POST',
        });
        console.log('👋 Logged out from server');
      }
    } catch (error) {
      // Continue with logout even if server call fails
      console.warn('⚠️ Server logout failed, continuing with local logout:', error);
    } finally {
      // Always clear local tokens
      this.removeAuthToken();
      console.log('🧹 Local session cleared');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  getCurrentUserData() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }
}

// Export singleton instance
export const apiService = new ApiService();
