const API_BASE_URL = "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem("token", token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem("token");
  }

  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const baseHeaders = this.getHeaders();
    // For FormData, allow browser to set Content-Type but keep Authorization
    if (options?.body instanceof FormData) {
      delete baseHeaders["Content-Type"];
    }
    const config = {
      ...options,
      headers: { ...baseHeaders, ...(options.headers || {}) },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Create a more detailed error object
        const error = new Error(data.message || "Something went wrong");
        error.status = response.status;
        error.errors = data.errors || [];
        error.success = data.success;
        throw error;
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication endpoints
  async signup(userData) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser() {
    return this.request("/auth/me");
  }

  // User endpoints
  async getUserProfile(username) {
    return this.request(`/users/${username}`);
  }

  async searchUsers(query) {
    return this.request(`/users/search?q=${encodeURIComponent(query)}`);
  }

  async followUser(userId) {
    return this.request(`/users/${userId}/follow`, {
      method: "POST",
    });
  }

  async unfollowUser(userId) {
    return this.request(`/users/${userId}/follow`, {
      method: "DELETE",
    });
  }

  async getFollowers(userId, page = 1) {
    return this.request(`/users/${userId}/followers?page=${page}`);
  }

  async getFollowing(userId, page = 1) {
    return this.request(`/users/${userId}/following?page=${page}`);
  }

  async checkFollowStatus(userId) {
    return this.request(`/users/${userId}/follow-status`);
  }

  async updateProfile(profileData) {
    return this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async uploadProfilePicture(formData) {
    return this.request("/users/profile/picture", {
      method: "POST",
      body: formData,
    });
  }

  async deleteAccount() {
    return this.request("/users/profile", {
      method: "DELETE",
    });
  }

  // Post endpoints
  async getPosts(page = 1, limit = 20) {
    return this.request(`/posts?page=${page}&limit=${limit}`);
  }

  async createPost(postData) {
    return this.request("/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  }

  async getPost(postId) {
    return this.request(`/posts/${postId}`);
  }

  async updatePost(postId, postData) {
    return this.request(`/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    });
  }

  async deletePost(postId) {
    return this.request(`/posts/${postId}`, {
      method: "DELETE",
    });
  }

  async likePost(postId) {
    return this.request(`/posts/${postId}/like`, {
      method: "POST",
    });
  }

  async unlikePost(postId) {
    return this.request(`/posts/${postId}/like`, {
      method: "POST",
    });
  }

  async addComment(postId, commentData) {
    return this.request(`/posts/${postId}/comment`, {
      method: "POST",
      body: JSON.stringify(commentData),
    });
  }

  async deleteComment(postId, commentId) {
    return this.request(`/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    });
  }

  async getUserPosts(userId, page = 1) {
    return this.request(`/users/${userId}/posts?page=${page}`);
  }

  // Chat endpoints
  async getUserChats(page = 1) {
    return this.request(`/chat?page=${page}`);
  }

  async createGroupChat(groupData) {
    return this.request("/chat/group", {
      method: "POST",
      body: JSON.stringify(groupData),
    });
  }

  async getChatById(chatId) {
    return this.request(`/chat/${chatId}`);
  }

  async deleteChat(chatId) {
    return this.request(`/chat/${chatId}`, {
      method: "DELETE",
    });
  }

  async leaveGroup(chatId) {
    return this.request(`/chat/${chatId}/leave`, {
      method: "POST",
    });
  }

  async getOrCreateDirectChat(userId) {
    return this.request("/chat/direct", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async getChatMessages(chatId, page = 1, limit = 50) {
    return this.request(`/chat/${chatId}/messages?page=${page}&limit=${limit}`);
  }

  async sendMessage(chatId, messageData) {
    return this.request(`/chat/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  }

  async reactToMessage(chatId, messageId, emoji) {
    return this.request(`/chat/${chatId}/messages/${messageId}/react`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    });
  }

  async deleteMessage(chatId, messageId) {
    return this.request(`/chat/${chatId}/messages/${messageId}`, {
      method: "DELETE",
    });
  }

  async markChatAsRead(chatId) {
    return this.request(`/chat/${chatId}/read`, {
      method: "PUT",
    });
  }

  async startTyping(chatId) {
    return this.request(`/chat/${chatId}/typing/start`, {
      method: "POST",
    });
  }

  async stopTyping(chatId) {
    return this.request(`/chat/${chatId}/typing/stop`, {
      method: "POST",
    });
  }

  async getTypingUsers(chatId) {
    return this.request(`/chat/${chatId}/typing`);
  }

  async updateGroupChat(chatId, groupData) {
    return this.request(`/chat/${chatId}`, {
      method: "PUT",
      body: JSON.stringify(groupData),
    });
  }

  async addGroupMember(chatId, userId) {
    return this.request(`/chat/${chatId}/members`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async removeGroupMember(chatId, userId) {
    return this.request(`/chat/${chatId}/members/${userId}`, {
      method: "DELETE",
    });
  }

  async getGroupMembers(chatId) {
    return this.request(`/chat/${chatId}/members`);
  }

  // Request endpoints
  async getFollowRequests(page = 1, limit = 20) {
    return this.request(`/requests/follow?page=${page}&limit=${limit}`);
  }

  async acceptFollowRequest(requestId) {
    return this.request(`/requests/follow/${requestId}/accept`, {
      method: "PUT",
    });
  }

  async rejectFollowRequest(requestId) {
    return this.request(`/requests/follow/${requestId}/reject`, {
      method: "PUT",
    });
  }

  async sendFollowRequest(userId) {
    return this.request(`/requests/follow`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async cancelFollowRequest(userId) {
    return this.request(`/requests/follow/${userId}`, {
      method: "DELETE",
    });
  }

  // Friend request endpoints
  async getFriendRequests(page = 1, limit = 20) {
    return this.request(`/requests/friend?page=${page}&limit=${limit}`);
  }

  async sendFriendRequest(userId, message = "") {
    return this.request("/requests/friend", {
      method: "POST",
      body: JSON.stringify({ userId, message }),
    });
  }

  async acceptFriendRequest(requestId) {
    return this.request(`/requests/friend/${requestId}/accept`, {
      method: "PUT",
    });
  }

  async rejectFriendRequest(requestId) {
    return this.request(`/requests/friend/${requestId}/reject`, {
      method: "PUT",
    });
  }

  async cancelFriendRequest(userId) {
    return this.request(`/requests/friend/${userId}`, {
      method: "DELETE",
    });
  }

  // Group invite endpoints
  async getGroupInvites(page = 1, limit = 20) {
    return this.request(`/requests/group?page=${page}&limit=${limit}`);
  }

  async sendGroupInvite(chatId, userId, message = "") {
    return this.request("/requests/group", {
      method: "POST",
      body: JSON.stringify({ chatId, userId, message }),
    });
  }

  async acceptGroupInvite(requestId) {
    return this.request(`/requests/group/${requestId}/accept`, {
      method: "PUT",
    });
  }

  async rejectGroupInvite(requestId) {
    return this.request(`/requests/group/${requestId}/reject`, {
      method: "PUT",
    });
  }

  async cancelGroupInvite(requestId) {
    return this.request(`/requests/group/${requestId}`, {
      method: "DELETE",
    });
  }

  // File upload endpoints
  async uploadFile(file, type = "image") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    return this.request("/upload", {
      method: "POST",
      body: formData,
    });
  }

  async uploadImage(imageFile) {
    return this.uploadFile(imageFile, "image");
  }

  async uploadDocument(documentFile) {
    return this.uploadFile(documentFile, "document");
  }

  // Search and discovery endpoints
  async searchPosts(query, page = 1) {
    return this.request(
      `/posts/search?q=${encodeURIComponent(query)}&page=${page}`
    );
  }

  async getTrendingPosts() {
    return this.request("/posts/trending");
  }

  async getRecommendedUsers() {
    return this.request("/users/recommended");
  }

  // Notification endpoints
  async getNotifications(page = 1, limit = 20) {
    return this.request(`/notifications?page=${page}&limit=${limit}`);
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: "PUT",
    });
  }

  async markAllNotificationsAsRead() {
    return this.request("/notifications/read-all", {
      method: "PUT",
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/notifications/${notificationId}`, {
      method: "DELETE",
    });
  }

  // Utility endpoints
  async getCurrentUser() {
    return this.request("/auth/me");
  }

  async refreshToken() {
    return this.request("/auth/refresh", {
      method: "POST",
    });
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }
}

export default new ApiService();
