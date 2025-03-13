import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';

function UserProfile() {
  const { username } = useParams();
  const [showOptions, setShowOptions] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock data - in a real app, this would come from your backend
  const user = {
    name: 'Emma Watson',
    username: username,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    posts: 42,
    followers: 1234,
    following: 567,
    bio: 'Actress | UN Women Goodwill Ambassador | Book lover 📚',
    posts: [
      {
        id: 1,
        image: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        likes: 245
      },
      {
        id: 2,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        likes: 189
      },
      {
        id: 3,
        image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        likes: 321
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <h1 className="text-2xl font-semibold">{user.username}</h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  isFollowing 
                    ? 'bg-gray-800 hover:bg-red-600 hover:text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">
                Message
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowOptions(!showOptions)}
                  className="text-white hover:text-gray-300 p-2"
                >
                  <MoreHorizontal size={24} />
                </button>
                {showOptions && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu">
                      <button className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700">
                        Share Profile
                      </button>
                      <button className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700">
                        Mute
                      </button>
                      <button className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-700">
                        Block
                      </button>
                      <button className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-700">
                        Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center md:justify-start space-x-8 mb-6">
            <div className="text-center md:text-left">
              <span className="font-semibold">{user.posts.length}</span>
              <span className="text-gray-400 block md:inline md:ml-2">posts</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-semibold">{user.followers.toLocaleString()}</span>
              <span className="text-gray-400 block md:inline md:ml-2">followers</span>
            </div>
            <div className="text-center md:text-left">
              <span className="font-semibold">{user.following.toLocaleString()}</span>
              <span className="text-gray-400 block md:inline md:ml-2">following</span>
            </div>
          </div>
          
          <div>
            <h2 className="font-semibold mb-1">{user.name}</h2>
            <p className="text-gray-400 whitespace-pre-line">{user.bio}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-1 mt-4">
          {user.posts.map((post) => (
            <div key={post.id} className="relative group aspect-square">
              <img 
                src={post.image} 
                alt="" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <div className="text-white text-center">
                  <span className="font-semibold">{post.likes}</span>
                  <span className="ml-1">likes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;