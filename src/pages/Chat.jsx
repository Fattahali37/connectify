import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Search, Plus, Loader2, RefreshCw } from "lucide-react";
import ChatItem from "../components/ChatItem";
import api from "../services/api";

function Chat() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    // Filter chats based on search query
    if (searchQuery.trim()) {
      const filtered = chats.filter(
        (chat) =>
          chat.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.lastMessage?.content
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  }, [searchQuery, chats]);

  const fetchChats = async (page = 1, append = false) => {
    try {
      setLoading(true);
      const response = await api.getUserChats(page);

      if (append) {
        setChats((prev) => [...prev, ...response.data.chats]);
      } else {
        setChats(response.data.chats);
      }

      setCurrentPage(response.data.pagination.currentPage);
      setHasMore(response.data.pagination.hasNextPage);
    } catch (error) {
      console.error("Error fetching chats:", error);
      if (error.status === 401) {
        api.removeToken();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshChats = async () => {
    setRefreshing(true);
    await fetchChats(1, false);
    setRefreshing(false);
  };

  const loadMoreChats = async () => {
    if (hasMore && !loading) {
      await fetchChats(currentPage + 1, true);
    }
  };

  const handleChatClick = (chat) => {
    navigate(`/chat/${chat._id}`);
  };

  const handleNewChat = () => {
    // Navigate to search page to find users to chat with
    navigate("/search");
  };

  if (loading && chats.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-500" size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-gray-400">
            Connect with your friends and followers
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshChats}
            disabled={refreshing}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleNewChat}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white transition-colors"
          >
            <Plus size={20} />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Chat List */}
      {filteredChats.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-gray-900 rounded-xl p-8">
            {searchQuery ? (
              <>
                <MessageCircle
                  size={48}
                  className="text-gray-400 mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">
                  No conversations found
                </h3>
                <p className="text-gray-400 mb-6">
                  No conversations match your search for "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-white transition-colors"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <MessageCircle
                  size={48}
                  className="text-gray-400 mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">
                  No conversations yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Start chatting with your friends and followers to see
                  conversations here!
                </p>
                <button
                  onClick={handleNewChat}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-white transition-colors"
                >
                  Start a Conversation
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {filteredChats.length} conversation
              {filteredChats.length !== 1 ? "s" : ""}
            </h2>
            {searchQuery && (
              <p className="text-gray-400 text-sm">
                Filtered by: "{searchQuery}"
              </p>
            )}
          </div>

          {/* Chat Items */}
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            {filteredChats.map((chat, index) => (
              <ChatItem
                key={chat._id}
                chat={chat}
                isActive={false}
                onClick={handleChatClick}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center py-6">
              <button
                onClick={loadMoreChats}
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  "Load More Conversations"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Chat;
