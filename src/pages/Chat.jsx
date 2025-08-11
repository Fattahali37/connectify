import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users, MessageCircle } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function Chat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: "",
    description: "",
    participants: [],
    isPrivate: false,
    allowMemberInvites: true,
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Load chats
  useEffect(() => {
    loadChats();
  }, []);

  // Load available users for group creation
  useEffect(() => {
    if (showCreateGroup) {
      loadAvailableUsers();
    }
  }, [showCreateGroup]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const response = await api.getUserChats();
      setChats(response.data.chats);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const response = await api.searchUsers("");
      setAvailableUsers(response.data.users.filter((u) => u._id !== user._id));
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupForm.name || groupForm.participants.length < 1) {
      alert("Please provide a group name and select at least one participant");
      return;
    }

    try {
      setIsCreatingGroup(true);
      const response = await api.createGroupChat(groupForm);
      setShowCreateGroup(false);
      setGroupForm({
        name: "",
        description: "",
        participants: [],
        isPrivate: false,
        allowMemberInvites: true,
      });
      loadChats(); // Refresh chat list
      navigate(`/chat/${response.data.chat._id}`);
    } catch (error) {
      console.error("Error creating group chat:", error);
      alert("Failed to create group chat");
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const toggleParticipant = (userId) => {
    setGroupForm((prev) => ({
      ...prev,
      participants: prev.participants.includes(userId)
        ? prev.participants.filter((id) => id !== userId)
        : [...prev.participants, userId],
    }));
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.participants?.some(
        (p) =>
          p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="flex-1 bg-gray-900 page-content">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-xl font-semibold">Messages</h1>
          <button
            onClick={() => setShowCreateGroup(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading chats...</p>
            </div>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-400 text-lg">No chats found</p>
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? "Try adjusting your search"
                : "Start a conversation to get started!"}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredChats.map((chat) => (
              <div
                key={chat._id}
                className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-colors cursor-pointer"
                onClick={() => navigate(`/chat/${chat._id}`)}
              >
                <div className="flex items-center space-x-4">
                  {/* Chat Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                    {chat.chatType === "group" ? (
                      <Users size={20} className="text-gray-400" />
                    ) : (
                      <span className="text-white font-medium text-sm">
                        {chat.participants?.[0]?.firstName?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium truncate">
                        {chat.chatType === "group"
                          ? chat.name
                          : `${chat.participants?.[0]?.firstName} ${chat.participants?.[0]?.lastName}`}
                      </h3>
                      {chat.lastMessage && (
                        <span className="text-gray-400 text-sm">
                          {new Date(
                            chat.lastMessage.createdAt
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {chat.lastMessage ? (
                      <p className="text-gray-400 text-sm truncate">
                        {chat.lastMessage.sender?.firstName}:{" "}
                        {chat.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm">No messages yet</p>
                    )}
                  </div>

                  {/* Unread Count */}
                  {chat.unreadCount > 0 && (
                    <div className="bg-purple-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-white text-xl font-semibold mb-4">
              Create Group Chat
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) =>
                    setGroupForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) =>
                    setGroupForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter group description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Select Participants
                </label>
                <div className="max-h-32 overflow-y-auto bg-gray-700 rounded-lg p-2">
                  {availableUsers.map((user) => (
                    <label
                      key={user._id}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-600 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={groupForm.participants.includes(user._id)}
                        onChange={() => toggleParticipant(user._id)}
                        className="text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-white text-sm">
                        {user.firstName} {user.lastName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={groupForm.isPrivate}
                    onChange={(e) =>
                      setGroupForm((prev) => ({
                        ...prev,
                        isPrivate: e.target.checked,
                      }))
                    }
                    className="text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-300 text-sm">Private Group</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={groupForm.allowMemberInvites}
                    onChange={(e) =>
                      setGroupForm((prev) => ({
                        ...prev,
                        allowMemberInvites: e.target.checked,
                      }))
                    }
                    className="text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-gray-300 text-sm">Allow Invites</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateGroup(false)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={
                  isCreatingGroup ||
                  !groupForm.name ||
                  groupForm.participants.length < 1
                }
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreatingGroup ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
