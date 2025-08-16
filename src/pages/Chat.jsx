import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Users,
  MessageCircle,
  Edit,
  MoreVertical,
  Send,
} from "lucide-react";
import ChatItem from "../components/ChatItem";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

function Chat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const searchInputRef = useRef(null);
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

  const handleSendMessageClick = () => {
    // Focus the search bar
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await api.deleteChat(chatId);
      // Remove the deleted chat from the local state
      setChats((prevChats) => prevChats.filter((chat) => chat._id !== chatId));
    } catch (error) {
      console.error("Error deleting chat:", error);
      alert("Failed to delete chat");
    }
  };

  return (
    <div className="flex h-full bg-black">
      {/* Chat List Panel */}
      <div className="w-80 bg-black border-r border-gray-800 flex flex-col">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-800">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              ref={searchInputRef}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-800 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-800 rounded w-32"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-gray-400 text-sm">No chats found</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <ChatItem
                key={chat._id}
                chat={chat}
                isActive={false}
                onClick={() => navigate(`/chat/${chat._id}`)}
                onDelete={handleDeleteChat}
              />
            ))
          )}
        </div>
      </div>

      {/* Message Display Area */}
      <div className="flex-1 bg-black flex flex-col items-center justify-center">
        <div className="text-center">
          {/* Text */}
          <h2 className="text-white text-2xl font-semibold mb-2">
            Your messages
          </h2>
          <p className="text-gray-400 text-lg mb-6">
            Send a message to start a chat.
          </p>

          {/* Send Message Button */}
          <button
            onClick={handleSendMessageClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors hover:scale-105 transform"
          >
            Send message
          </button>
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-white text-xl font-semibold mb-4">
              Create New Group
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) =>
                    setGroupForm({ ...groupForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={groupForm.description}
                  onChange={(e) =>
                    setGroupForm({ ...groupForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Enter group description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Participants
                </label>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {availableUsers.map((user) => (
                    <label
                      key={user._id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={groupForm.participants.includes(user._id)}
                        onChange={() => toggleParticipant(user._id)}
                        className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-white text-sm">
                        {user.firstName} {user.lastName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateGroup(false)}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
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
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
