import React, { useState, useMemo } from 'react';
import { User, Chat } from '../../types.ts';
import UserProfile from '../user/UserProfile.tsx';
import TaggingMenu from '../chat/TaggingMenu.tsx';

interface MainSidebarProps {
  currentUser: User;
  chats: Chat[];
  users: User[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onShowProfile: () => void;
  onLogout: () => void;
  tags: string[];
  onCreateTag: (tag: string) => void;
  onSetChatTag: (chatId: string, tag: string | null) => void;
  isLoading: boolean;
}

const ChatListItemSkeleton = () => (
    <li className="flex items-center p-2 mb-1">
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse mr-3"></div>
      <div className="flex-grow">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
    </li>
);

const MainSidebar: React.FC<MainSidebarProps> = ({ currentUser, chats, users, activeChatId, onSelectChat, onShowProfile, onLogout, tags, onCreateTag, onSetChatTag, isLoading }) => {
  const [activeTab, setActiveTab] = useState('dm'); // 'dm', 'group', or tag name
  const [taggingMenu, setTaggingMenu] = useState<{ chatId: string; x: number; y: number } | null>(null);

  const getChatPartner = (chat: Chat) => {
    if (chat.isGroup) return null;
    const partnerId = chat.participants.find(p => p !== currentUser.id);
    return users.find(u => u.id === partnerId);
  };
  
  const handleCreateNewTag = () => {
    const newTag = prompt("Enter a name for the new tag:");
    if (newTag) {
        onCreateTag(newTag);
    }
  };

  const handleOpenTagMenu = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setTaggingMenu({ chatId, x: e.clientX, y: e.clientY });
  };

  const filteredChats = useMemo(() => {
    if (activeTab === 'dm') return chats.filter(c => !c.isGroup);
    if (activeTab === 'group') return chats.filter(c => c.isGroup);
    return chats.filter(c => c.tag === activeTab);
  }, [chats, activeTab]);

  const TabButton: React.FC<{ name: string, label: string }> = ({ name, label }) => (
    <button 
        onClick={() => setActiveTab(name)}
        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${activeTab === name ? 'bg-brand-pink-500 text-white' : 'text-gray-600 hover:bg-brand-pink-200'}`}>
        {label}
    </button>
  );

  return (
    <div className="w-80 bg-brand-pink-100/50 flex flex-col relative">
      <div className="p-4 border-b border-brand-pink-200/50">
        <input type="text" placeholder="Find or start a conversation" className="w-full bg-brand-pink-50 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-pink-400" />
      </div>

      <div className="p-2 border-b border-brand-pink-200/50">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <TabButton name="dm" label="Direct Messages" />
            <TabButton name="group" label="Groups" />
            {tags.map(tag => <TabButton key={tag} name={tag} label={tag} />)}
            <button onClick={handleCreateNewTag} className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold text-lg transition">+</button>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-2">
        {isLoading ? (
            <ul>
                {[...Array(8)].map((_, i) => <ChatListItemSkeleton key={i} />)}
            </ul>
        ) : filteredChats.length > 0 ? (
            <ul>
            {filteredChats.map(chat => {
                const partner = getChatPartner(chat);
                const name = chat.isGroup ? chat.name : partner?.name;
                const avatar = chat.isGroup ? `https://picsum.photos/seed/${chat.id}/48/48` : partner?.avatar;
                const activity = chat.isGroup ? `${chat.participants.length} members` : partner?.activity || chat.lastMessage;

                return (
                <li 
                    key={chat.id} 
                    onClick={() => onSelectChat(chat.id)}
                    className={`flex items-center p-2 rounded-lg cursor-pointer mb-1 group relative ${activeChatId === chat.id ? 'bg-brand-pink-200/60' : 'hover:bg-brand-pink-200/30'}`}
                >
                    <div className="relative">
                        <img src={avatar} alt={name} className="w-10 h-10 rounded-full mr-3" />
                        {!chat.isGroup && partner?.status === 'online' && <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-brand-pink-100/50"></div>}
                    </div>
                    <div className="flex-grow overflow-hidden">
                    <p className="font-semibold text-gray-800 truncate">{name}</p>
                    <p className="text-sm text-gray-600 truncate">{activity}</p>
                    </div>
                    <button onClick={(e) => handleOpenTagMenu(e, chat.id)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 hover:bg-brand-pink-200 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                    </button>
                </li>
                )
            })}
            </ul>
        ) : (
            <div className="text-center text-gray-500 pt-10">
                <p>No conversations here.</p>
            </div>
        )}
      </div>
      
      {taggingMenu && (
        <TaggingMenu 
          tags={tags}
          chatId={taggingMenu.chatId}
          onSetTag={onSetChatTag}
          onClose={() => setTaggingMenu(null)}
          position={taggingMenu}
        />
      )}

      <UserProfile user={currentUser} onClick={onShowProfile} onLogout={onLogout} />
    </div>
  );
};

export default MainSidebar;