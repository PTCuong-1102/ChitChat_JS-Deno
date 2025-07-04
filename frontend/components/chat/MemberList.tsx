
import React from 'react';
import { User } from '../../types.ts';

interface MemberListProps {
  participants: User[];
  currentUser: User;
}

const MemberList: React.FC<MemberListProps> = ({ participants, currentUser }) => {
  const admin = participants[0]; // Mock admin
  const members = participants.slice(1);

  return (
    <aside className="w-64 bg-brand-pink-100/50 flex-shrink-0 p-4 border-l border-brand-pink-200/50">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700">Members</h3>
            <button className="text-gray-500 hover:text-brand-pink-500 text-xl">+</button>
        </div>
        
        <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Admin</h4>
            <ul>
                <li className="flex items-center p-2 rounded-lg">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full mr-3" />
                    <span className="font-semibold text-gray-800">You</span>
                </li>
            </ul>
        </div>
        <div className="mt-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Members</h4>
            <ul>
                {participants.map(user => user.id !== currentUser.id && (
                    <li key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-brand-pink-200/30 group">
                        <div className="flex items-center">
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                            <span className="font-semibold text-gray-800">{user.name}</span>
                        </div>
                        <button className="text-gray-400 opacity-0 group-hover:opacity-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    </aside>
  );
};

export default MemberList;