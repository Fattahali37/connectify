import React from 'react';

const posts = [
  {
    id: 1,
    user: {
      name: 'Emma Watson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80'
    },
    image: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    likes: 1234,
    caption: 'Beautiful sunset at the beach! 🌅',
    comments: 89
  },
  {
    id: 2,
    user: {
      name: 'Tom Holland',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80'
    },
    image: 'https://images.unsplash.com/photo-1682687220198-88e9bdea9931?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    likes: 2567,
    caption: 'Just another day in New York City 🗽',
    comments: 156
  }
];

function Home() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {posts.map(post => (
        <div key={post.id} className="bg-gray-900 rounded-xl mb-6 overflow-hidden">
          <div className="p-4 flex items-center">
            <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full" />
            <span className="ml-3 font-medium">{post.user.name}</span>
          </div>
          
          <img src={post.image} alt="" className="w-full aspect-square object-cover" />
          
          <div className="p-4">
            <div className="flex items-center space-x-4 mb-4">
              <button className="text-red-500 hover:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="text-white hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>
            
            <div className="text-sm">
              <span className="font-bold">{post.likes.toLocaleString()}</span> likes
            </div>
            
            <p className="mt-2">
              <span className="font-bold mr-2">{post.user.name}</span>
              {post.caption}
            </p>
            
            <button className="text-gray-400 text-sm mt-2">
              View all {post.comments} comments
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Home