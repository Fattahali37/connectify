import React from 'react';

function Profile() {
  const user = {
    name: 'John Doe',
    username: 'johndoe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    posts: 42,
    followers: 1234,
    following: 567,
    bio: 'Photography enthusiast | Travel lover | Coffee addict ☕'
  };

  const userPosts = [
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
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      likes: 176
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1502791451862-7bd8c1df43a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      likes: 289
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-purple-600"
        />
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <h1 className="text-2xl font-semibold">{user.username}</h1>
            <button className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors duration-200">
              Edit Profile
            </button>
          </div>
          
          <div className="flex justify-center md:justify-start space-x-8 mb-6">
            <div className="text-center md:text-left">
              <span className="font-semibold">{user.posts}</span>
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
          {userPosts.map((post) => (
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

export default Profile;