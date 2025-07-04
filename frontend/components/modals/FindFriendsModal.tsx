import React, { useState, useMemo, useEffect } from 'react';
import { User, Chat } from '../../types.ts';

interface FindFriendsModalProps {
  onClose: () => void;
  currentUser: User;
}

const FindFriendsModal: React.FC<FindFriendsModalProps> = ({ onClose, currentUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Simulate fetching all users and current user's chats
    useEffect(() => {
        setIsLoading(true);
        // In a real app, these would be API calls
        setTimeout(() => {
             const mockUsers = [
                { id: 'user-nelly', name: 'Nelly', avatar: 'https://picsum.photos/seed/nelly/48/48' },
                { id: 'user-peppe', name: 'Peppe', avatar: 'https://picsum.photos/seed/peppe/48/48' },
                { id: 'user-phibi', name: 'Phibi', avatar: 'https://picsum.photos/seed/phibi/48/48' },
                { id: 'user-new', name: 'New User', avatar: 'https://picsum.photos/seed/new/48/48' },
            ];
            const mockChats: Chat[] = [
                { id: 'dm-nelly', isGroup: false, participants: [currentUser.id, 'user-nelly'] }
            ];
            setAllUsers(mockUsers);
            setChats(mockChats);
            setIsLoading(false);
        }, 800);
    }, [currentUser.id]);

    const friendIds = useMemo(() => {
        const ids = new Set<string>();
        chats.forEach(chat => {
            if (!chat.isGroup && chat.participants.includes(currentUser.id)) {
                chat.participants.forEach(pId => {
                    if (pId !== currentUser.id) ids.add(pId);
                });
            }
        });
        return ids;
    }, [chats, currentUser.id]);

    const filteredUsers = allUsers.filter(user => 
        user.id !== currentUser.id && 
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative m-4 flex flex-col" style={{height: '600px'}} onClick={e => e.stopPropagation()}>
        <div className="flex-shrink-0">
            <h3 className="text-xl font-bold text-center mb-4 text-brand-pink-500">Find Friends</h3>
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="Search for users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 bg-brand-pink-50 border border-brand-pink-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink-400 transition"
              />
              <svg className="h-5 w-5 absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
            {isLoading ? (
                <div className="text-center text-gray-500 py-10">Loading users...</div>
            ) : (
                <div className="space-y-2">
                    {filteredUsers.map(user => {
                        const isFriend = friendIds.has(user.id);
                        return (
                            <div key={user.id} className="flex items-center justify-between p-2 hover:bg-brand-pink-50 rounded-lg">
                                <div className="flex items-center">
                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                </div>
                                {isFriend ? (
                                    <button className="px-3 py-1 text-sm text-gray-500 bg-gray-200 rounded-full cursor-default">Friend</button>
                                ) : (
                                    <button className="px-3 py-1 text-sm text-white bg-brand-pink-500 hover:bg-brand-pink-600 rounded-full transition">Make friend</button>
                                )}
                            </div>
                        )
                    })}
                     {searchTerm && filteredUsers.length === 0 && (
                        <div className="text-center text-gray-500 py-10">
                            <p>No users found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="mt-6 text-center flex-shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindFriendsModal;