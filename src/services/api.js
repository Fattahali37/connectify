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
    const config = {
      headers: this.getHeaders(),
      ...options,
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
    return this.request(`/users/profile/${username}`);
  }

  async updateProfile(profileData) {
    return this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async searchUsers(query, page = 1, limit = 10, filter = "all") {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      filter: filter,
    });
    return this.request(`/users/search?${params}`);
  }

  async followUser(userId) {
    return this.request(`/users/follow/${userId}`, {
      method: "POST",
    });
  }

  async unfollowUser(userId) {
    return this.request(`/users/follow/${userId}`, {
      method: "DELETE",
    });
  }

  async getFollowers(page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/users/followers?${params}`);
  }

  async getFollowing(page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/users/following?${params}`);
  }

  // Post endpoints
  async getPosts(page = 1, limit = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/posts?${params}`);
  }

  async getPost(postId) {
    return this.request(`/posts/${postId}`);
  }

  async createPost(postData) {
    return this.request("/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  }

  async toggleLike(postId) {
    return this.request(`/posts/${postId}/like`, {
      method: "POST",
    });
  }

  async addComment(postId, text) {
    return this.request(`/posts/${postId}/comment`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  async deletePost(postId) {
    return this.request(`/posts/${postId}`, {
      method: "DELETE",
    });
  }

  async getUserPosts(userId, page = 1, limit = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/posts/user/${userId}?${params}`);
  }

  // Chat endpoints
  async getUserChats(page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/chat?${params}`);
  }

  async getOrCreateDirectChat(userId) {
    return this.request("/chat/direct", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async createGroupChat(groupData) {
    return this.request("/chat/group", {
      method: "POST",
      body: JSON.stringify(groupData),
    });
  }

  async getChatMessages(chatId, page = 1, limit = 50) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/chat/${chatId}/messages?${params}`);
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
      method: "POST",
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

  // Notification endpoints
  async getNotifications(page = 1, limit = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/notifications?${params}`);
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: "POST",
    });
  }

  async markAllNotificationsAsRead() {
    return this.request("/notifications/read-all", {
      method: "POST",
    });
  }

  // File upload helper (for future implementation)
  async uploadFile(file, onProgress) {
    // This is a placeholder for file upload implementation
    // You can integrate with services like:
    // - AWS S3
    // - Cloudinary
    // - Multer for local storage

    return new Promise((resolve, reject) => {
      // Simulate file upload
      setTimeout(() => {
        resolve({
          url: URL.createObjectURL(file),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
      }, 1000);
    });
  }
}

export default new ApiService();
