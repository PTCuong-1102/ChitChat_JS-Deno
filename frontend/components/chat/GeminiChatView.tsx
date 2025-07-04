
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Bot } from '../../types.ts';
import MessageBubble from './MessageBubble.tsx';
import ChatInput from './ChatInput.tsx';
import { geminiService } from '../../services/geminiService.ts';

interface GeminiChatViewProps {
  currentUser: User;
  users: User[];
  bot?: Bot;
}

const GeminiChatView: React.FC<GeminiChatViewProps> = ({ currentUser, users, bot }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  // Create bot user - prioritize custom bot, then look for existing user, finally create default
  const botUser = bot ? 
    { id: bot.id, name: bot.name, avatar: bot.avatar, status: 'online' } as User :
    users.find(u => u.id === 'user-gemini') ||
    {
      id: 'user-gemini',
      name: 'Gemini Bot',
      avatar: 'https://cdn-icons-png.flaticon.com/512/8943/8943377.png', // Default Gemini icon
      status: 'online'
    } as User;

  useEffect(() => {
    setMessages([
      { 
        id: `gem-msg-${Date.now()}`, 
        senderId: botUser.id,
        content: bot?.description ? `Hello! I'm ${bot.name}. ${bot.description}` : "Hello! I'm Gemini. How can I assist you today?", 
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) 
      }
    ])
  }, [bot, botUser.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      content,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    const botResponseContent = await geminiService.getBotResponse(content, bot?.apiKey);
    
    const botMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      senderId: botUser.id,
      content: botResponseContent,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMessage]);
  };

  // botUser is now guaranteed to exist, so remove this check
  // if (!botUser) {
  //   return <div className="p-4">Bot user not found.</div>
  // }

  return (
    <div className="flex-grow flex flex-col bg-white">
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id}
              message={msg}
              sender={msg.senderId === currentUser.id ? currentUser : botUser}
              isOwnMessage={msg.senderId === currentUser.id}
            />
          ))}
          {isTyping && (
             <div className="flex items-start gap-3">
                <img src={botUser.avatar} alt={botUser.name} className="w-10 h-10 rounded-full" />
                 <div className="mt-1 p-3 rounded-2xl rounded-bl-none bg-gray-100 max-w-lg">
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                    </div>
                 </div>
             </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
};

export default GeminiChatView;
