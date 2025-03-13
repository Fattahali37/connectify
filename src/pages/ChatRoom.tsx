import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Send, Image, Smile, Share2 } from 'lucide-react';

function ChatRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock data - replace with real backend data
  const chat = {
    id: Number(id),
    name: 'Emma Watson',
    username: 'emma_watson',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80',
    online: true,
    messages: [
      { id: 1, text: 'Hey, how are you?', sent: false, time: '2:30 PM' },
      { id: 2, text: "I'm good, thanks! How about you?", sent: true, time: '2:31 PM' },
      { id: 3, text: 'The event starts at 7 PM, will you be there?', sent: false, time: '2:32 PM' }
    ]
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setMessage('');
    }
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const handleShare = (platform: string) => {
    const profileLink = `https://instagram.com/${chat.username}`;
    let url = '';

    switch (platform) {
      case 'instagram':
        url = `https://www.instagram.com/share?url=${profileLink}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${profileLink}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${profileLink}`;
        break;
    }

    if (url) {
      window.open(url, '_blank');
    }
    setShowShareOptions(false);
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/chat')} className="text-white hover:text-gray-300">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center cursor-pointer" onClick={() => navigate(`/user/${chat.username}`)}>
            <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-full" />
            <div className="ml-3">
              <h3 className="font-medium text-white">{chat.name}</h3>
              <p className="text-sm text-green-500">{chat.online ? 'Online' : 'Offline'}</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="text-white hover:text-gray-300"
          >
            <MoreVertical size={24} />
          </button>
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu">
                <button 
                  className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700"
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <button 
                  className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-700"
                >
                  Report User
                </button>
                <button 
                  className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-700"
                >
                  Block User
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
              msg.sent ? 'bg-purple-600' : 'bg-gray-800'
            }`}>
              <p className="text-white">{msg.text}</p>
              <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-gray-900 p-4">
        <div className="flex items-center space-x-4">
          <button type="button" className="text-gray-400 hover:text-white">
            <Image size={24} />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 rounded-full px-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button type="button" className="text-gray-400 hover:text-white">
            <Smile size={24} />
          </button>
          <button 
            type="submit" 
            className="text-white bg-purple-600 hover:bg-purple-700 rounded-full p-2"
            disabled={!message.trim()}
          >
            <Send size={20} />
          </button>
          <button 
            onClick={() => setShowShareOptions(!showShareOptions)}
            type="button" 
            className="text-gray-400 hover:text-white"
          >
            <Share2 size={24} />
          </button>
        </div>

        {showShareOptions && (
          <div className="absolute bottom-16 right-4 w-48 bg-gray-800 text-white rounded-lg shadow-lg p-2">
            <button 
              onClick={() => handleShare('instagram')} 
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Share to Instagram
            </button>
            <button 
              onClick={() => handleShare('whatsapp')} 
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Share to WhatsApp
            </button>
            <button 
              onClick={() => handleShare('twitter')} 
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Share to Twitter
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default ChatRoom;
