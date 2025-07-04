import React, { useState, useEffect, useRef } from 'react';
import { User, Chat, Message } from '../../types.ts';
import MessageBubble from './MessageBubble.tsx';
import ChatInput from './ChatInput.tsx';

interface ChatViewProps {
  chat: Chat;
  currentUser: User;
  users: User[];
  searchTerm: string;
}

const ChatView: React.FC<ChatViewProps> = ({ chat, currentUser, users, searchTerm }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Simulate fetching messages for the selected chat
  useEffect(() => {
    setIsLoading(true);
    // In a real app, you'd fetch this from your backend: /api/chats/${chat.id}/messages
    setTimeout(() => {
        // Mock data for demonstration until backend is connected
        const mockMessages: {[key: string]: Message[]} = {
            'dm-nelly': [
              { id: 'msg1', senderId: 'user-nelly', content: 'Hiii', timestamp: '02:50 SA' },
              { id: 'msg2', senderId: currentUser.id, content: 'Hey, Nelly.', timestamp: '07:48 SA' },
              { id: 'msg3', senderId: currentUser.id, content: 'Happy birthday to u', timestamp: '07:50 SA' },
            ],
            'group-1': [
              { id: 'gmsg1', senderId: 'user-nelly', content: 'Hiii', timestamp: '02:50 SA' },
              { id: 'gmsg2', senderId: 'user-lyy', content: 'Hey, Nelly.', timestamp: '07:48 SA' },
              { id: 'gmsg3', senderId: currentUser.id, content: 'Happy birthday to u', timestamp: '07:50 SA' },
              { id: 'gmsg4', senderId: 'user-locke', content: '??????', timestamp: '07:51 SA' },
            ],
        };
      setMessages(mockMessages[chat.id] || []);
      setIsLoading(false);
    }, 500);
  }, [chat.id, currentUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    // This is an optimistic update. The message should be sent to the backend here.
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      content,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' SA',
    };
    setMessages(prev => [...prev, newMessage]);
  };
  
  const getUserById = (id: string) => users.find(u => u.id === id);

  const filteredMessages = searchTerm
    ? messages.filter(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()))
    : messages;
    
  if (isLoading) {
    return (
        <div className="flex-grow flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand-pink-200 border-t-brand-pink-500 rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col bg-white">
      <div className="flex-grow p-6 overflow-y-auto">
        {filteredMessages.length > 0 ? (
          <div className="space-y-6">
            {filteredMessages.map((msg) => (
              <MessageBubble 
                key={msg.id}
                message={msg}
                sender={getUserById(msg.senderId)}
                isOwnMessage={msg.senderId === currentUser.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            {searchTerm ? <p>No messages found for "{searchTerm}"</p> : <p>This is the beginning of your conversation.</p>}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
};

export default ChatView;