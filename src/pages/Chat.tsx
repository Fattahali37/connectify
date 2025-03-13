
import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';

const chats = [
  {
    id: 1,
    name: 'Photography Group',
    isGroup: true,
    avatar: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80',
    lastMessage: 'Amazing shots everyone! 📸',
    time: '2m ago',
    unread: 3
  },
  {
    id: 2,
    name: 'Emma Watson',
    username: 'emma_watson',
    isGroup: false,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80',
    lastMessage: 'The event starts at 7 PM',
    time: '1h ago',
    unread: 1
  },
  {
    id: 3,
    name: 'Travel Enthusiasts',
    isGroup: true,
    avatar: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80',
    lastMessage: "Who's up for the weekend trip? 🏔️",
    time: '3h ago',
    unread: 0
  }
];

function Chat() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const handleChatClick = (chatId: number) => {
    navigate(`/chat/${chatId}`);
  };

  const handleProfileClick = (e: React.MouseEvent, username?: string) => {
    e.stopPropagation();
    if (username) {
      navigate(`/user/${username}`);
    }
  };

  const ChatOptions = ({ chatId }: { chatId: number }) => (
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
      <div className="py-1" role="menu">
        <button className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700">
          Mute notifications
        </button>
        <button className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700">
          Mark as unread
        </button>
        <button className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-700">
          Block
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Messages</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200">
          New Message
        </button>
      </div>

      <div className="space-y-2">
        {chats.map((chat) => (
          <div 
            key={chat.id} 
            className="bg-gray-900 p-4 rounded-xl flex items-center cursor-pointer hover:bg-gray-800 transition-colors duration-200 relative"
            onClick={() => handleChatClick(chat.id)}
          >
            <div 
              className="relative"
              onClick={(e) => handleProfileClick(e, chat.username)}
            >
              <img 
                src={chat.avatar} 
                alt={chat.name} 
                className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity duration-200" 
              />
              {chat.isGroup && (
                <div className="absolute bottom-0 right-0 bg-purple-600 w-4 h-4 rounded-full flex items-center justify-center">
                  <span className="text-xs">👥</span>
                </div>
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-center">
                <h3 className="font-medium hover:underline" onClick={(e) => handleProfileClick(e, chat.username)}>
                  {chat.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{chat.time}</span>
                  <div className="relative">
                    <button 
                      className="text-gray-400 hover:text-white p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === chat.id ? null : chat.id);
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeMenu === chat.id && <ChatOptions chatId={chat.id} />}
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-1">{chat.lastMessage}</p>
            </div>

            {chat.unread > 0 && (
              <div className="ml-4 bg-purple-600 w-6 h-6 rounded-full flex items-center justify-center">
                <span className="text-xs">{chat.unread}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Chat;