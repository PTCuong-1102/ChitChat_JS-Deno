
import React from 'react';
import { User } from '../../types.ts';

interface WelcomeViewProps {
  users: User[];
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ users }) => {
  const onlineUsers = users.filter(u => u.status === 'online').slice(0, 6);

  return (
    <div className="flex-grow flex flex-col items-center justify-center bg-white p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to ChitChat!</h2>
        <p className="text-gray-500 mb-8">Select a conversation from the sidebar to start chatting.</p>
        
        <div className="flex flex-col items-start bg-brand-pink-50 p-6 rounded-xl border border-brand-pink-100">
            <div className="w-full flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">Online — {onlineUsers.length}</h3>
                <button className="text-sm text-gray-500 hover:text-brand-pink-500">All</button>
            </div>

            <div className="space-y-4 w-96">
                {onlineUsers.map(user => (
                    <div key={user.id} className="flex items-center w-full">
                        <div className="relative">
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-brand-pink-50"></div>
                        </div>
                        <div className="ml-3">
                            <p className="font-semibold text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.activity}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeView;