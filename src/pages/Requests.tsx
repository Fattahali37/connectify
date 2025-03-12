import React from 'react';

const followRequests = [
  {
    id: 1,
    name: 'Mark Ruffalo',
    username: 'mark_ruffalo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80'
  },
  {
    id: 2,
    name: 'Elizabeth Olsen',
    username: 'elizabeth_olsen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80'
  }
];

function Requests() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Follow Requests</h2>
      
      <div className="space-y-4">
        {followRequests.map(request => (
          <div key={request.id} className="bg-gray-900 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center">
              <img src={request.avatar} alt={request.name} className="w-12 h-12 rounded-full" />
              <div className="ml-4">
                <p className="font-medium">{request.name}</p>
                <p className="text-gray-400 text-sm">@{request.username}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
                Accept
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Requests