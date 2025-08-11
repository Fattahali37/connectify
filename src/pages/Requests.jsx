import React, { useState } from "react";
import { UserPlus, Check, X } from "lucide-react";

function Requests() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      user: {
        name: "Alice Johnson",
        username: "alice_j",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80",
      },
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      user: {
        name: "Bob Smith",
        username: "bob_smith",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80",
      },
      timestamp: "1 day ago",
    },
  ]);

  const handleAccept = (requestId) => {
    // TODO: Accept follow request via backend
    setRequests(requests.filter((req) => req.id !== requestId));
  };

  const handleDecline = (requestId) => {
    // TODO: Decline follow request via backend
    setRequests(requests.filter((req) => req.id !== requestId));
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Follow Requests</h1>
        <p className="text-gray-400">Manage incoming follow requests</p>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
            <p>No pending follow requests</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={request.user.avatar}
                    alt={request.user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{request.user.name}</h3>
                    <p className="text-gray-400 text-sm">
                      @{request.user.username}
                    </p>
                    <p className="text-gray-500 text-xs">{request.timestamp}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAccept(request.id)}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
                    title="Accept"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => handleDecline(request.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                    title="Decline"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Requests;
