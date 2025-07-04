import React, { useState, useMemo } from 'react';
import FarLeftSidebar from './FarLeftSidebar.tsx';
import MainSidebar from './MainSidebar.tsx';
import TopBar from './TopBar.tsx';
import ChatView from '../chat/ChatView.tsx';
import { User, Chat, Message, Bot } from '../../types.ts';
import MemberList from '../chat/MemberList.tsx';
import WelcomeView from '../chat/WelcomeView.tsx';
import GeminiChatView from '../chat/GeminiChatView.tsx';
import ConfigureBotModal from '../modals/ConfigureBotModal.tsx';
import UserProfileModal from '../modals/UserProfileModal.tsx';
import FindFriendsModal from '../modals/FindFriendsModal.tsx';
import OtherUserProfileModal from '../modals/OtherUserProfileModal.tsx';

interface MainLayoutProps {
  currentUser: User;
  users: User[];
  chats: Chat[];
  bots: Bot[];
  onCreateBot: (bot: Bot) => void;
  tags: string[];
  onCreateTag: (tag: string) => void;
  onSetChatTag: (chatId: string, tag: string | null) => void;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
  isLoading: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ currentUser, users, chats, bots, onCreateBot, tags, onCreateTag, onSetChatTag, onLogout, onUserUpdate, isLoading }) => {
  const [view, setView] = useState<'chat' | 'gemini' | string>('chat');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showConfigureBotModal, setShowConfigureBotModal] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showFindFriendsModal, setShowFindFriendsModal] = useState(false);
  const [inChatSearchTerm, setInChatSearchTerm] = useState('');
  const [viewedUser, setViewedUser] = useState<User | null>(null);

  const handleSelectView = (selectedView: 'chat' | 'gemini' | string) => {
    setView(selectedView);
    if (selectedView !== 'chat') {
      setActiveChatId(null);
    }
  };
  
  const handleCreateBot = (bot: Bot) => {
    onCreateBot(bot);
    setShowConfigureBotModal(false);
  };

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeCustomBot = bots.find(b => b.id === view);

  const getChatPartner = (chat: Chat | undefined): User | null => {
    if (!chat || chat.isGroup) return null;
    const partnerId = chat.participants.find(p => p !== currentUser.id);
    return users.find(u => u.id === partnerId) || null;
  };

  const chatPartner = getChatPartner(activeChat);
  
  const getChatName = (chat: Chat) => {
    if (chat.isGroup) return chat.name;
    const partner = getChatPartner(chat);
    return partner?.name;
  };
  
  const getTopBarName = () => {
    if (activeCustomBot) return activeCustomBot.name;
    if (view === 'gemini') return 'Gemini Bot';
    if (activeChat) return getChatName(activeChat);
    return 'ChitChat';
  }

  const handleShowProfile = () => setShowUserProfileModal(true);
  const handleCloseProfile = () => setShowUserProfileModal(false);

  const handleShowPartnerProfile = (user: User) => setViewedUser(user);
  const handleClosePartnerProfile = () => setViewedUser(null);
  
  const friendIds = useMemo(() => {
    const ids = new Set<string>();
    chats.forEach(chat => {
        if (!chat.isGroup && chat.participants.includes(currentUser.id)) {
            chat.participants.forEach(pId => {
                if (pId !== currentUser.id) {
                    ids.add(pId);
                }
            });
        }
    });
    return ids;
  }, [chats, currentUser.id]);

  return (
    <div className="flex h-screen">
      <FarLeftSidebar 
        currentView={view} 
        onSelectView={handleSelectView} 
        bots={bots}
        onOpenConfigureBotModal={() => setShowConfigureBotModal(true)}
        onOpenFindFriendsModal={() => setShowFindFriendsModal(true)}
      />
      {view !== 'chat' ? (
        <div className="flex-1 flex flex-col">
            <TopBar 
                chatName={getTopBarName()}
                isGroup={false}
                isChatActive={false}
                searchTerm=""
                onSearchTermChange={() => {}}
                chatPartner={null}
                onShowPartnerProfile={() => {}}
            />
            <GeminiChatView currentUser={currentUser} bot={activeCustomBot} users={users} />
        </div>
      ) : (
        <>
        <MainSidebar
            currentUser={currentUser}
            chats={chats}
            users={users}
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
            onShowProfile={handleShowProfile}
            onLogout={onLogout}
            tags={tags}
            onCreateTag={onCreateTag}
            onSetChatTag={onSetChatTag}
            isLoading={isLoading}
        />
        <main className="flex-1 flex flex-col bg-white">
            <TopBar 
                chatName={getTopBarName()} 
                isGroup={activeChat?.isGroup ?? false}
                isChatActive={!!activeChat}
                searchTerm={inChatSearchTerm}
                onSearchTermChange={setInChatSearchTerm}
                chatPartner={chatPartner}
                onShowPartnerProfile={handleShowPartnerProfile}
            />
            {activeChat ? (
                <div className="flex flex-1 overflow-hidden">
                    <ChatView 
                        key={activeChat.id}
                        chat={activeChat} 
                        currentUser={currentUser}
                        users={users}
                        searchTerm={inChatSearchTerm}
                    />
                    {activeChat.isGroup && (
                        <MemberList 
                            currentUser={currentUser}
                            participants={users.filter(u => activeChat.participants.includes(u.id))} 
                        />
                    )}
                </div>
            ) : (
                <WelcomeView users={users} />
            )}
        </main>
        </>
      )}

      {showConfigureBotModal && <ConfigureBotModal onClose={() => setShowConfigureBotModal(false)} onCreate={handleCreateBot} />}
      {showUserProfileModal && <UserProfileModal user={currentUser} onClose={handleCloseProfile} onUserUpdate={onUserUpdate} />}
      {showFindFriendsModal && <FindFriendsModal onClose={() => setShowFindFriendsModal(false)} currentUser={currentUser} />}
      {viewedUser && <OtherUserProfileModal user={viewedUser} onClose={handleClosePartnerProfile} currentUser={currentUser} isFriend={friendIds.has(viewedUser.id)}/>}
    </div>
  );
};

export default MainLayout;