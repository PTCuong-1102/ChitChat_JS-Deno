
import React from 'react';
import { User } from '../../types.ts';

interface UserProfileProps {
  user: User;
  onClick: () => void;
  onLogout?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onClick, onLogout }) => {
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="w-full flex-shrink-0 flex items-center p-4 bg-brand-pink-200/40">
      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
      <div className="flex-grow text-left">
        <p className="font-semibold text-gray-800">{user.name}</p>
        <p className="text-sm text-gray-600">{user.status || 'online'}</p>
      </div>
      <div className="flex items-center space-x-2">
        {/* Settings Button */}
        <button 
          onClick={onClick}
          className="p-2 rounded-full text-gray-500 hover:text-brand-pink-600 hover:bg-brand-pink-200/60 transition-colors"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.494 3.404a1 1 0 01.556.556l.328.89c.244.662.89.967 1.597.967h.917a1 1 0 01.99.858l.123.979a1 1 0 01-.383 1.085l-.75.525a1.002 1.002 0 00-.332 1.488l.525.75a1 1 0 01-.15 1.258l-.89.89a1 1 0 01-1.258.15l-.75-.525a1 1 0 00-1.488.332l-.525.75a1 1 0 01-1.085.383l-.979-.123a1 1 0 01-.858-.99v-.917a1 1 0 00-1.63-.82l-.89.328a1 1 0 01-1.14-.383l-.68-.847a1 1 0 01.15-1.258l.75-.525a1 1 0 00.332-1.488l-.525-.75a1 1 0 01.15-1.258l.89-.89a1 1 0 011.258-.15l.75.525a1 1 0 001.488-.332l.525-.75a1 1 0 011.085-.383l.979.123a1 1 0 01.858.99v.917c.707 0 1.353-.305 1.597-.967l.328-.89a1 1 0 01.556-.556zM8 9.5A1.5 1.5 0 108 6.5a1.5 1.5 0 000 3z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* Logout Button */}
        {onLogout && (
          <button 
            onClick={handleLogoutClick}
            className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-100 transition-colors"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
