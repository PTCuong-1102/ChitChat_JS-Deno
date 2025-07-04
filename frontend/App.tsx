import React, { useState, useEffect } from 'react';
import AuthPage from './components/auth/AuthPage.tsx';
import MainLayout from './components/layout/MainLayout.tsx';
import { User, Chat, Message, Bot } from './types.ts';
import { apiService } from './services/apiService.ts';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // Check for existing authentication on app load
  useEffect(() => {
    const initializeApp = async () => {
      if (apiService.isAuthenticated()) {
        try {
          setIsLoading(true);
          const userData = apiService.getCurrentUserData();
          if (userData) {
            setCurrentUser(userData);
            setIsAuthenticated(true);
            
            // Load bootstrap data
            const bootstrapData = await apiService.getBootstrapData();
            setUsers(bootstrapData.users || []);
            setChats(bootstrapData.chats || []);
            setTags(bootstrapData.tags || []);
            setBots(bootstrapData.bots || []);
          }
        } catch (error) {
          console.error('Failed to initialize app:', error);
          apiService.logout();
        }
      }
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const handleAuth = async (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    
    try {
      setIsLoading(true);
      const bootstrapData = await apiService.getBootstrapData();
      setUsers(bootstrapData.users || []);
      setChats(bootstrapData.chats || []);
      setTags(bootstrapData.tags || []);
      setBots(bootstrapData.bots || []);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBot = (newBot: Bot) => {
    setBots(prev => [...prev, newBot]);
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      // Always clear local state
      setIsAuthenticated(false);
      setCurrentUser(null);
      setUsers([]);
      setChats([]);
      setTags([]);
      setBots([]);
    }
  };

  const handleSetChatTag = (chatId: string, tag: string | null) => {
    // In a real app, this would be an API call
    setChats(prevChats => prevChats.map(c => 
      c.id === chatId ? { ...c, tag: tag || undefined } : c
    ));
  };

  const handleCreateTag = (newTag: string) => {
    // In a real app, this would be an API call
    if (newTag && !tags.includes(newTag)) {
        setTags(prev => [...prev, newTag]);
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    console.log('🔄 App.handleUserUpdate called:', updatedUser);
    setCurrentUser(updatedUser);
    
    // Update localStorage to persist changes
    localStorage.setItem('chitchat_user_data', JSON.stringify(updatedUser));
    
    // Update users list if the user exists there
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    
    console.log('✅ User state updated in App');
  };
  
  // Show loading screen on initial app load
  if (isLoading && !isAuthenticated) {
    return (
      <div className="bg-brand-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ChitChat...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated || !currentUser) {
    return <AuthPage onSignIn={handleAuth} onSignUp={handleAuth} />;
  }

  return (
    <div className="bg-brand-bg min-h-screen text-gray-800">
      <MainLayout 
        currentUser={currentUser}
        users={users}
        chats={chats}
        bots={bots}
        onCreateBot={handleCreateBot}
        tags={tags}
        onCreateTag={handleCreateTag}
        onSetChatTag={handleSetChatTag}
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
        isLoading={isLoading}
      />
    </div>
  );
};

export default App;
