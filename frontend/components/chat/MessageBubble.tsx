
import React from 'react';
import { User, Message } from '../../types.ts';

interface MessageBubbleProps {
  message: Message;
  sender?: User;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, sender, isOwnMessage }) => {
  if (isOwnMessage) {
    return (
      <div className="flex justify-end items-start gap-3">
        <div className="flex flex-col items-end">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-500">{message.timestamp}</span>
            <span className="font-semibold text-gray-800">You</span>
          </div>
          <div className="mt-1 p-3 rounded-2xl rounded-br-none bg-brand-pink-200/60 max-w-lg">
            <p className="text-gray-800">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <img src={sender?.avatar} alt={sender?.name} className="w-10 h-10 rounded-full" />
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-gray-800">{sender?.name}</span>
          <span className="text-sm text-gray-500">{message.timestamp}</span>
        </div>
        <div className="mt-1 p-3 rounded-2xl rounded-bl-none bg-gray-100 max-w-lg">
          <p className="text-gray-800">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;