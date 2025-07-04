
import React, { useState } from 'react';
import { User } from '../../types.ts';

interface OtherUserProfileModalProps {
  user: User;
  currentUser: User;
  isFriend: boolean;
  onClose: () => void;
}

const OtherUserProfileModal: React.FC<OtherUserProfileModalProps> = ({ user, isFriend: initialIsFriend, onClose }) => {
  const [isFriend, setIsFriend] = useState(initialIsFriend);
  const [isBlocked, setIsBlocked] = useState(false); // Mock block state

  const handleFriendAction = () => {
    // In a real app, this would trigger an API call.
    setIsFriend(!isFriend);
  };
  
  const handleBlockAction = () => {
     // In a real app, this would trigger an API call and likely close the modal/chat.
    setIsBlocked(!isBlocked);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 relative m-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-center mb-6 text-brand-pink-500">Profile</h3>

        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full mb-4 ring-4 ring-brand-pink-200" />
             {user.status === 'online' && <div className="absolute bottom-4 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>}
          </div>
          <h4 className="text-xl font-semibold text-gray-800">{user.name}</h4>
          <p className="text-sm text-gray-500">{user.activity || user.username}</p>
        </div>

        <div className="flex justify-center space-x-2 mb-8">
          {isFriend ? (
             <button onClick={handleFriendAction} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition">Unfriend</button>
          ) : (
             <button onClick={handleFriendAction} className="px-4 py-2 text-sm bg-brand-pink-500 text-white font-semibold rounded-lg hover:bg-brand-pink-600 transition">Add Friend</button>
          )}

          <button 
            onClick={handleBlockAction} 
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${isBlocked ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
              {isBlocked ? 'Unblock' : 'Block'}
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-8 py-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtherUserProfileModal;
