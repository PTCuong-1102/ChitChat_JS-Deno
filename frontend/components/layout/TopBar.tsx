
import React, { useState } from 'react';
import { User } from '../../types.ts';
import FriendRequestsModal from '../modals/FriendRequestsModal.tsx';
import NotificationsModal from '../modals/NotificationsModal.tsx';

interface TopBarProps {
  chatName?: string;
  isGroup: boolean;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  isChatActive: boolean;
  chatPartner: User | null;
  onShowPartnerProfile: (user: User) => void;
}

const TopBar: React.FC<TopBarProps> = ({ chatName, isGroup, searchTerm, onSearchTermChange, isChatActive, chatPartner, onShowPartnerProfile }) => {
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
    <header className="flex-shrink-0 h-16 flex items-center justify-between px-6 bg-white shadow-sm border-b border-brand-pink-200/50">
      <div className="flex items-center">
        {isGroup ? (
          <div className="w-6 h-6 rounded-md bg-gray-300 mr-3 flex items-center justify-center text-gray-600 font-bold">#</div>
        ) : (
          isChatActive && <div className="w-3 h-3 rounded-full bg-gray-400 mr-3"></div>
        )}
        <h2 className="text-lg font-bold text-gray-800">{chatName}</h2>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={() => setShowFriendRequests(true)} className="text-gray-500 hover:text-brand-pink-500">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" /></svg>
        </button>
        <button onClick={() => setShowNotifications(true)} className="text-gray-500 hover:text-brand-pink-500 relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search in chat..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            disabled={!isChatActive}
            className="w-48 bg-brand-pink-50 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-brand-pink-400 disabled:bg-gray-200 disabled:cursor-not-allowed" 
          />
           <svg className="h-4 w-4 absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
        </div>
        {chatPartner && (
            <button onClick={() => onShowPartnerProfile(chatPartner)} className="flex items-center">
                <img src={chatPartner.avatar} alt={chatPartner.name} className="w-8 h-8 rounded-full" />
            </button>
        )}
      </div>
    </header>
    {showFriendRequests && <FriendRequestsModal onClose={() => setShowFriendRequests(false)} />}
    {showNotifications && <NotificationsModal onClose={() => setShowNotifications(false)} />}
    </>
  );
};

export default TopBar;
