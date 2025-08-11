import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import {
  User,
  Edit,
  Camera,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Globe,
  Lock,
  Bell,
  Shield,
  Palette,
  Save,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  FileText,
  Settings,
  Heart,
  MessageSquare,
  Users,
  Bookmark,
  Share2,
  MoreVertical,
  LogOut,
} from "lucide-react";
import api from "../services/api";

function Profile() {
  const { user, updateUser } = useAuth();
  const { success, error, info } = useNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    phone: "",
    website: "",
    dateOfBirth: "",
    gender: "",
    interests: [],
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    profileVisibility: "public",
    showOnlineStatus: true,
    allowMessages: "everyone",
    theme: "dark",
    language: "en",
  });

  // Data state
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
    totalLikes: 0,
    totalComments: 0,
  });

  // Load user data
  useEffect(() => {
    if (user) {
      loadUserData();
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        phone: user.phone || "",
        website: user.website || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        interests: user.interests || [],
      });
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const [postsResponse, followersResponse, followingResponse] =
        await Promise.all([
          api.getUserPosts(user._id),
          api.getFollowers(user._id),
          api.getFollowing(user._id),
        ]);

      setPosts(postsResponse.data.posts || []);
      setFollowers(followersResponse.data.followers || []);
      setFollowing(followingResponse.data.following || []);

      // Calculate stats based on freshly fetched data to avoid stale state
      const fetchedPosts = postsResponse.data.posts || [];
      const fetchedFollowers = followersResponse.data.followers || [];
      const fetchedFollowing = followingResponse.data.following || [];

      const totalLikes = fetchedPosts.reduce(
        (sum, post) => sum + (post.likes?.length || 0),
        0
      );
      const totalComments = fetchedPosts.reduce(
        (sum, post) => sum + (post.comments?.length || 0),
        0
      );

      setStats({
        postsCount: fetchedPosts.length,
        followersCount: fetchedFollowers.length,
        followingCount: fetchedFollowing.length,
        totalLikes,
        totalComments,
      });
    } catch (err) {
      console.error("Error loading user data:", err);
      error("Error", "Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await api.updateProfile(profileForm);
      updateUser(response.data.user);
      setIsEditing(false);
      success("Profile Updated", "Your profile has been updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      error("Error", "Failed to update profile");
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      error("File Too Large", "Please select an image smaller than 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await api.uploadProfilePicture(formData);
      updateUser(response.data.user);
      setShowImageUpload(false);
      success(
        "Profile Picture Updated",
        "Your profile picture has been updated"
      );
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      error("Error", "Failed to upload profile picture");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount();
      // This will trigger logout in AuthContext
      success("Account Deleted", "Your account has been permanently deleted");
    } catch (err) {
      console.error("Error deleting account:", err);
      error("Error", "Failed to delete account");
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      // AuthContext will handle the logout
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const addInterest = (interest) => {
    if (interest.trim() && !profileForm.interests.includes(interest.trim())) {
      setProfileForm((prev) => ({
        ...prev,
        interests: [...prev.interests, interest.trim()],
      }));
    }
  };

  const removeInterest = (interestToRemove) => {
    setProfileForm((prev) => ({
      ...prev,
      interests: prev.interests.filter(
        (interest) => interest !== interestToRemove
      ),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-900 page-content">
      {/* Profile Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-8">
        <div className="flex items-start justify-between">
          {/* Profile Info */}
          <div className="flex items-start space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt=""
                    className="w-24 h-24 object-cover"
                  />
                ) : (
                  <span className="text-white font-medium text-3xl">
                    {user?.firstName?.charAt(0) || "U"}
                  </span>
                )}
              </div>

              {/* Upload Button */}
              <button
                onClick={() => setShowImageUpload(true)}
                className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
                title="Change profile picture"
              >
                <Camera size={16} />
              </button>
            </div>

            {/* User Details */}
            <div className="flex-1">
              <h1 className="text-white text-3xl font-bold mb-2">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-400 text-lg mb-3">@{user?.username}</p>

              {user?.bio && (
                <p className="text-gray-300 mb-4 max-w-2xl">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center space-x-8 text-sm">
                <div className="text-center">
                  <div className="text-white font-semibold text-lg">
                    {stats.postsCount}
                  </div>
                  <div className="text-gray-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold text-lg">
                    {stats.followersCount}
                  </div>
                  <div className="text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold text-lg">
                    {stats.followingCount}
                  </div>
                  <div className="text-gray-400">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold text-lg">
                    {stats.totalLikes}
                  </div>
                  <div className="text-gray-400">Total Likes</div>
                </div>
              </div>

              {/* Location and Join Date */}
              <div className="flex items-center space-x-4 mt-4 text-gray-400 text-sm">
                {user?.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>
                    Joined {new Date(user?.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isEditing
                  ? "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                {isEditing ? <X size={16} /> : <Edit size={16} />}
                <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
              </div>
            </button>

            {isEditing && (
              <button
                onClick={handleProfileUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("settings")}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 px-6">
        <div className="flex space-x-1">
          {[
            { id: "profile", label: "Profile", icon: User },
            {
              id: "posts",
              label: "Posts",
              icon: FileText,
              count: stats.postsCount,
            },
            {
              id: "followers",
              label: "Followers",
              icon: Users,
              count: stats.followersCount,
            },
            {
              id: "following",
              label: "Following",
              icon: Users,
              count: stats.followingCount,
            },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-gray-900 text-white border-b-2 border-purple-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="ml-2 text-gray-500">({tab.count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="profile-content p-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto">
            {isEditing ? (
              <ProfileEditForm
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                addInterest={addInterest}
                removeInterest={removeInterest}
              />
            ) : (
              <ProfileView user={user} />
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="text-gray-400 mx-auto mb-4" size={48} />
                <p className="text-gray-400 text-lg">No posts yet</p>
                <p className="text-gray-500 text-sm">
                  Create your first post to get started!
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium text-sm">
                          {user?.firstName?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-white font-medium">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <span className="text-gray-400">@{user?.username}</span>
                        <span className="text-gray-500 text-sm">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-4">{post.content}</p>
                      {post.image && (
                        <img
                          src={post.image}
                          alt=""
                          className="rounded-lg max-w-full h-auto"
                        />
                      )}
                      <div className="flex items-center space-x-6 text-gray-400 text-sm">
                        <div className="flex items-center space-x-1">
                          <Heart size={16} />
                          <span>{post.likes?.length || 0} likes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare size={16} />
                          <span>{post.comments?.length || 0} comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Followers Tab */}
        {activeTab === "followers" && (
          <div className="text-center py-12">
            <Users className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-400 text-lg">Followers list coming soon</p>
          </div>
        )}

        {/* Following Tab */}
        {activeTab === "following" && (
          <div className="text-center py-12">
            <Users className="text-gray-400 mx-auto mb-4" size={48} />
            <p className="text-gray-400 text-lg">Following list coming soon</p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="settings-content">
            <SettingsTab
              settings={settings}
              setSettings={setSettings}
              onLogout={handleLogout}
              onDeleteAccount={() => setShowDeleteConfirm(true)}
            />
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={(input) => {
          if (input) input.style.display = "none";
        }}
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: "none" }}
        onClick={(e) => {
          if (showImageUpload) {
            e.target.value = null;
          }
        }}
      />

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-white text-lg font-semibold mb-4">
              Change Profile Picture
            </h3>
            <p className="text-gray-400 mb-4">Select a new profile picture</p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  document.querySelector('input[type="file"]').click()
                }
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Choose File
              </button>
              <button
                onClick={() => setShowImageUpload(false)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-white text-lg font-semibold mb-4">
              Delete Account
            </h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Profile Edit Form Component
function ProfileEditForm({
  profileForm,
  setProfileForm,
  addInterest,
  removeInterest,
}) {
  const [newInterest, setNewInterest] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newInterest.trim()) {
      addInterest(newInterest);
      setNewInterest("");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-white text-2xl font-semibold">Edit Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-medium">Basic Information</h3>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              First Name
            </label>
            <input
              type="text"
              value={profileForm.firstName}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  firstName: e.target.value,
                }))
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={profileForm.lastName}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  lastName: e.target.value,
                }))
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={profileForm.username}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              rows={3}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-medium">
            Contact Information
          </h3>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Location
            </label>
            <input
              type="text"
              value={profileForm.location}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Website
            </label>
            <input
              type="url"
              value={profileForm.website}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, website: e.target.value }))
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-white text-lg font-medium">
          Additional Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={profileForm.dateOfBirth}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  dateOfBirth: e.target.value,
                }))
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Gender
            </label>
            <select
              value={profileForm.gender}
              onChange={(e) =>
                setProfileForm((prev) => ({ ...prev, gender: e.target.value }))
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Interests
          </label>
          <form onSubmit={handleSubmit} className="flex space-x-2 mb-3">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Add an interest..."
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={16} />
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {profileForm.interests.map((interest, index) => (
              <span
                key={index}
                className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
              >
                <span>{interest}</span>
                <button
                  onClick={() => removeInterest(interest)}
                  className="hover:text-red-200 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile View Component
function ProfileView({ user }) {
  return (
    <div className="space-y-6">
      <h2 className="text-white text-2xl font-semibold">Profile Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-medium">Basic Information</h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">First Name:</span>
              <span className="text-white">{user?.firstName || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Name:</span>
              <span className="text-white">{user?.lastName || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Username:</span>
              <span className="text-white">@{user?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Bio:</span>
              <span className="text-white">{user?.bio || "No bio added"}</span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-medium">
            Contact Information
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phone:</span>
              <span className="text-white">{user?.phone || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Location:</span>
              <span className="text-white">{user?.location || "Not set"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Website:</span>
              <span className="text-white">{user?.website || "Not set"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-white text-lg font-medium">
          Additional Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Date of Birth:</span>
              <span className="text-white">
                {user?.dateOfBirth
                  ? new Date(user.dateOfBirth).toLocaleDateString()
                  : "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gender:</span>
              <span className="text-white">{user?.gender || "Not set"}</span>
            </div>
          </div>

          <div>
            <span className="text-gray-400 block mb-2">Interests:</span>
            {user?.interests && user.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">No interests added</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ settings, setSettings, onLogout, onDeleteAccount }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-white text-2xl font-semibold">Settings</h2>

      {/* Notifications */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white text-lg font-medium mb-4 flex items-center space-x-2">
          <Bell size={20} />
          <span>Notifications</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">
                Email Notifications
              </span>
              <p className="text-gray-400 text-sm">
                Receive notifications via email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    emailNotifications: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">Push Notifications</span>
              <p className="text-gray-400 text-sm">
                Receive push notifications
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    pushNotifications: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white text-lg font-medium mb-4 flex items-center space-x-2">
          <Shield size={20} />
          <span>Privacy</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.profileVisibility}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  profileVisibility: e.target.value,
                }))
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Allow Messages From
            </label>
            <select
              value={settings.allowMessages}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  allowMessages: e.target.value,
                }))
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="everyone">Everyone</option>
              <option value="friends">Friends Only</option>
              <option value="none">No One</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-white font-medium">Show Online Status</span>
              <p className="text-gray-400 text-sm">
                Let others see when you're online
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showOnlineStatus}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    showOnlineStatus: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white text-lg font-medium mb-4 flex items-center space-x-2">
          <Palette size={20} />
          <span>Appearance</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-medium mb-2">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, theme: e.target.value }))
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, language: e.target.value }))
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white text-lg font-medium mb-4 flex items-center space-x-2">
          <Lock size={20} />
          <span>Account Actions</span>
        </h3>

        <div className="space-y-4">
          <button
            onClick={onLogout}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

          <button
            onClick={onDeleteAccount}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Trash2 size={16} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
