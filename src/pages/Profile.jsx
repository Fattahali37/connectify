import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
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
  Grid,
  Bookmark as BookmarkIcon,
  UserCheck,
} from "lucide-react";
import api from "../services/api";

function Profile() {
  const { user, updateUser } = useAuth();
  const { success, error, info } = useNotifications();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
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
    <div className="flex-1 bg-black page-content">
      {/* Profile Header - Instagram Style */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="flex items-start space-x-8">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden border-2 border-gray-700">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt=""
                  className="w-24 h-24 object-cover rounded-full"
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
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors border-2 border-white"
              title="Change profile picture"
            >
              <Camera size={16} />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {/* Username and Edit Button */}
            <div className="flex items-center space-x-4 mb-4">
              <h1 className="text-white text-2xl font-light">
                @{user?.username}
              </h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-1.5 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
              >
                Edit profile
              </button>
            </div>

            {/* Stats Row */}
            <div className="flex items-center space-x-8 mb-4">
              <div className="text-center">
                <span className="text-white font-semibold text-lg">
                  {stats.postsCount}
                </span>
                <span className="text-gray-400 text-sm ml-1">posts</span>
              </div>
              <div className="text-center">
                <span className="text-white font-semibold text-lg">
                  {stats.followersCount}
                </span>
                <span className="text-gray-400 text-sm ml-1">followers</span>
              </div>
              <div className="text-center">
                <span className="text-white font-semibold text-lg">
                  {stats.followingCount}
                </span>
                <span className="text-gray-400 text-sm ml-1">following</span>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mb-4">
              <div className="text-white font-semibold mb-1">
                {user?.firstName} {user?.lastName}
              </div>
              {user?.bio && (
                <p className="text-white text-sm mb-2">{user.bio}</p>
              )}
              {user?.location && (
                <p className="text-gray-400 text-sm mb-1">{user.location}</p>
              )}
              {user?.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm hover:underline"
                >
                  {user.website}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Instagram Style */}
      <div className="border-t border-gray-800">
        <div className="flex justify-center">
          <div className="flex space-x-8">
            <button
              onClick={() => {
                setActiveTab("posts");
                setIsEditing(false); // Reset editing state when switching to posts
              }}
              className={`flex items-center space-x-2 py-3 border-t-2 transition-colors ${
                activeTab === "posts"
                  ? "border-white text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Grid size={16} />
              <span className="text-sm font-medium">POSTS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div>
            {isEditing ? (
              <ProfileEditForm
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                addInterest={addInterest}
                removeInterest={removeInterest}
              />
            ) : (
              <div>
                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-2 border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-white text-xl font-semibold mb-2">
                      Share Photos
                    </h3>
                    <p className="text-gray-400 mb-4">
                      When you share photos, they will appear on your profile.
                    </p>
                    <button
                      onClick={() => navigate("/create-post")}
                      className="bg-blue-500 text-white px-6 py-2 rounded font-medium hover:bg-blue-600 transition-colors"
                    >
                      Share your first photo
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1">
                    {posts.map((post) => (
                      <div
                        key={post._id}
                        className="aspect-square bg-gray-800 relative group cursor-pointer"
                      >
                        {post.image ? (
                          <img
                            src={post.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText size={32} className="text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-4 text-white">
                            <div className="flex items-center space-x-1">
                              <Heart size={20} />
                              <span>{post.likes?.length || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare size={20} />
                              <span>{post.comments?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
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

export default Profile;
