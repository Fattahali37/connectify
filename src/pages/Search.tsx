import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

const suggestedUsers = [
  {
    id: 1,
    name: 'Chris Evans',
    username: 'chris_evans',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80'
  },
  {
    id: 2,
    name: 'Scarlett Johansson',
    username: 'scarlett_j',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80'
  },
  {
    id: 3,
    name: 'Robert Downey Jr',
    username: 'robert_downey',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80'
  }
];

function Search() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="relative mb-8">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-3 bg-gray-900 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestedUsers.map(user => (
          <div key={user.id} className="bg-gray-900 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center">
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
              <div className="ml-4">
                <p className="font-medium">{user.name}</p>
                <p className="text-gray-400 text-sm">@{user.username}</p>
              </div>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search