import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import {
  UserPlus,
  UserCheck,
  UserX,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Requests() {
  const { user } = useAuth();
  const { success, error, info } = useNotifications();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("follow");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Load requests based on active tab
  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      let response;

      switch (activeTab) {
        case "follow":
          response = await api.getFollowRequests();
          break;
        case "friend":
          response = await api.getFriendRequests();
          break;
        case "group":
          response = await api.getGroupInvites();
          break;
        default:
          response = await api.getFollowRequests();
      }

      setRequests(response.data.requests || []);
    } catch (err) {
      console.error("Error loading requests:", err);
      error("Error", "Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRequests = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  // Handle follow request actions
  const handleFollowRequest = async (requestId, action) => {
    try {
      if (action === "accept") {
        await api.acceptFollowRequest(requestId);
        success("Request Accepted", "You are now following this user");
      } else {
        await api.rejectFollowRequest(requestId);
        info("Request Rejected", "Follow request has been rejected");
      }

      // Remove the request from the list
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error("Error handling follow request:", err);
      error("Error", "Failed to process request");
    }
  };

  // Handle friend request actions
  const handleFriendRequest = async (requestId, action) => {
    try {
      if (action === "accept") {
        await api.acceptFriendRequest(requestId);
        success(
          "Friend Request Accepted",
          "You are now friends with this user"
        );
      } else {
        await api.rejectFriendRequest(requestId);
        info("Friend Request Rejected", "Friend request has been rejected");
      }

      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error("Error handling friend request:", err);
      error("Error", "Failed to process friend request");
    }
  };

  // Handle group invite actions
  const handleGroupInvite = async (requestId, action) => {
    try {
      if (action === "accept") {
        await api.acceptGroupInvite(requestId);
        success("Group Invite Accepted", "You have joined the group");
      } else {
        await api.rejectGroupInvite(requestId);
        info("Group Invite Rejected", "Group invite has been rejected");
      }

      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (err) {
      console.error("Error handling group invite:", err);
      error("Error", "Failed to process group invite");
    }
  };

  // Filter requests based on search and filter
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.sender?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.sender?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.sender?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter = filter === "all" || request.status === filter;

    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex-1 bg-black page-content">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-black page-content">
      {/* Header - Instagram Style */}
      <div className="bg-black border-b border-gray-800 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white p-1 rounded transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-white text-lg font-semibold">Requests</h1>
          </div>
          <button
            onClick={refreshRequests}
            disabled={refreshing}
            className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors disabled:opacity-50"
            title="Refresh requests"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Tabs - Instagram Style */}
      <div className="border-b border-gray-800">
        <div className="flex justify-center">
          <div className="flex space-x-8">
            {[
              {
                id: "follow",
                label: "Follow Requests",
                count: requests.filter((r) => r.type === "follow").length,
              },
              {
                id: "friend",
                label: "Friend Requests",
                count: requests.filter((r) => r.type === "friend").length,
              },
              {
                id: "group",
                label: "Group Invites",
                count: requests.filter((r) => r.type === "group").length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 border-t-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-white text-white"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 max-w-2xl mx-auto">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border border-gray-800"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="px-4 max-w-2xl mx-auto">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 border-2 border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">
              No requests
            </h3>
            <p className="text-gray-400">
              {searchTerm || filter !== "all"
                ? "Try adjusting your search"
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                onFollowRequest={handleFollowRequest}
                onFriendRequest={handleFriendRequest}
                onGroupInvite={handleGroupInvite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Request Card Component - Instagram Style
function RequestCard({
  request,
  onFollowRequest,
  onFriendRequest,
  onGroupInvite,
}) {
  const { user } = useAuth();
  const { info } = useNotifications();

  const handleAction = (action) => {
    switch (request.type) {
      case "follow":
        onFollowRequest(request._id, action);
        break;
      case "friend":
        onFriendRequest(request._id, action);
        break;
      case "group":
        onGroupInvite(request._id, action);
        break;
      default:
        console.error("Unknown request type:", request.type);
    }
  };

  const getRequestMessage = () => {
    switch (request.type) {
      case "follow":
        return "wants to follow you";
      case "friend":
        return "wants to be your friend";
      case "group":
        return `invited you to join "${request.group?.name || "Group"}"`;
      default:
        return "sent you a request";
    }
  };

  const getActionButtons = () => {
    if (request.status !== "pending") return null;

    return (
      <div className="flex space-x-2 mt-3">
        <button
          onClick={() => handleAction("accept")}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          Accept
        </button>
        <button
          onClick={() => handleAction("reject")}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors border border-gray-700"
        >
          Decline
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-start space-x-4">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
            {request.sender?.profilePicture ? (
              <img
                src={request.sender.profilePicture}
                alt=""
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-medium text-lg">
                {request.sender?.firstName?.charAt(0) || "U"}
              </span>
            )}
          </div>
        </div>

        {/* Request Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-white font-semibold text-base">
                {request.sender?.firstName} {request.sender?.lastName}
              </h3>
              <p className="text-gray-400 text-sm mb-1">
                @{request.sender?.username}
              </p>

              {/* Request Message */}
              <p className="text-gray-300 text-sm">
                <span className="font-medium">{request.sender?.firstName}</span>{" "}
                {getRequestMessage()}
              </p>

              {/* Additional Info */}
              {request.message && (
                <p className="text-gray-400 text-sm mt-2 italic">
                  "{request.message}"
                </p>
              )}

              {/* Action Buttons */}
              {getActionButtons()}
            </div>

            {/* Status and Date */}
            <div className="text-right text-xs text-gray-500">
              <div className="mb-1">
                {new Date(request.createdAt).toLocaleDateString()}
              </div>
              <div
                className={`capitalize ${
                  request.status === "pending"
                    ? "text-yellow-400"
                    : request.status === "accepted"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {request.status}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Requests;
