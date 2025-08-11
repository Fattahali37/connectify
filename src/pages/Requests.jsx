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
} from "lucide-react";
import api from "../services/api";

function Requests() {
  const { user } = useAuth();
  const { success, error, info } = useNotifications();
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

  const getRequestIcon = (type) => {
    switch (type) {
      case "follow":
        return <UserPlus className="w-5 h-5 text-blue-400" />;
      case "friend":
        return <Users className="w-5 h-5 text-green-400" />;
      case "group":
        return <Users className="w-5 h-5 text-purple-400" />;
      default:
        return <UserPlus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRequestStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-400";
      case "accepted":
        return "text-green-400";
      case "rejected":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getRequestStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900 page-content">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-xl font-semibold">Requests</h1>
          <button
            onClick={refreshRequests}
            disabled={refreshing}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Refresh requests"
          >
            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 px-6">
        <div className="flex space-x-1">
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
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white border-b-2 border-purple-500"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-purple-600 text-white text-xs rounded-full px-2 py-1">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-700 text-white rounded-lg pl-10 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="requests-container p-4">
        {filteredRequests.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <UserPlus className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-400 text-lg">No requests found</p>
              <p className="text-gray-500 text-sm">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filter"
                  : "You're all caught up!"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                onFollowRequest={handleFollowRequest}
                onFriendRequest={handleFriendRequest}
                onGroupInvite={handleGroupInvite}
                getRequestIcon={getRequestIcon}
                getRequestStatusColor={getRequestStatusColor}
                getRequestStatusIcon={getRequestStatusIcon}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Request Card Component
function RequestCard({
  request,
  onFollowRequest,
  onFriendRequest,
  onGroupInvite,
  getRequestIcon,
  getRequestStatusColor,
  getRequestStatusIcon,
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
          className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
        >
          <CheckCircle size={16} />
          <span>Accept</span>
        </button>
        <button
          onClick={() => handleAction("reject")}
          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center space-x-1"
        >
          <XCircle size={16} />
          <span>Reject</span>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-colors">
      <div className="flex items-start space-x-4">
        {/* Request Icon */}
        <div className="flex-shrink-0">{getRequestIcon(request.type)}</div>

        {/* Request Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                {request.sender?.profilePicture ? (
                  <img
                    src={request.sender.profilePicture}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-medium text-sm">
                    {request.sender?.firstName?.charAt(0) || "U"}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-white font-medium">
                  {request.sender?.firstName} {request.sender?.lastName}
                </h3>
                <p className="text-gray-400 text-sm">
                  @{request.sender?.username}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center space-x-1 ${getRequestStatusColor(
                  request.status
                )}`}
              >
                {getRequestStatusIcon(request.status)}
                <span className="text-sm capitalize">{request.status}</span>
              </div>

              <span className="text-gray-500 text-sm">
                {new Date(request.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Request Message */}
          <p className="text-gray-300 mt-2">
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
      </div>
    </div>
  );
}

export default Requests;
