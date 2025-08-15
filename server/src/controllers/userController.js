const User = require("../models/User");
const Post = require("../models/Post");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Request = require("../models/Request");

// @desc    Get user profile by username
// @route   GET /api/users/profile/:username
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password -refreshToken"
    );

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if current user is following this user
    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.includes(user._id);

    // Get user's post count
    const postCount = await Post.countDocuments({
      user: user._id,
      isPublic: true,
      isActive: true,
    });

    const profileData = {
      ...user.toObject(),
      isFollowing,
      postCount,
      followersCount: user.followers.length,
      followingCount: user.following.length,
    };

    res.json({
      success: true,
      data: {
        user: profileData,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get user by username (public endpoint)
// @route   GET /api/users/:username
// @access  Public
const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password -refreshToken -email"
    );

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's post count
    const postCount = await Post.countDocuments({
      user: user._id,
      isPublic: true,
      isActive: true,
    });

    const profileData = {
      ...user.toObject(),
      postCount,
      followersCount: user.followers.length,
      followingCount: user.following.length,
    };

    res.json({
      success: true,
      data: {
        user: profileData,
      },
    });
  } catch (error) {
    console.error("Get user by username error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, profilePicture } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        firstName: firstName || req.user.firstName,
        lastName: lastName || req.user.lastName,
        bio: bio !== undefined ? bio : req.user.bio,
        profilePicture: profilePicture || req.user.profilePicture,
      },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 20, filter = "all" } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchQuery = q.trim();
    const skip = (page - 1) * limit;

    // Build search criteria
    let searchCriteria = {
      _id: { $ne: req.user._id }, // Exclude current user
      isActive: true,
      $or: [
        { username: { $regex: searchQuery, $options: "i" } },
        { firstName: { $regex: searchQuery, $options: "i" } },
        { lastName: { $regex: searchQuery, $options: "i" } },
        { bio: { $regex: searchQuery, $options: "i" } },
      ],
    };

    // Apply filters
    if (filter === "following") {
      const currentUser = await User.findById(req.user._id);
      searchCriteria._id = { $in: currentUser.following };
    } else if (filter === "followers") {
      const currentUser = await User.findById(req.user._id);
      searchCriteria._id = { $in: currentUser.followers };
    } else if (filter === "not-following") {
      const currentUser = await User.findById(req.user._id);
      searchCriteria._id = {
        $nin: [...currentUser.following, req.user._id],
      };
    }

    // Execute search with simple sorting
    const users = await User.find(searchCriteria)
      .select(
        "username firstName lastName bio profilePicture followers following"
      )
      .sort({ username: 1 }) // Simple sort by username
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments(searchCriteria);

    // Add follow status for each user
    const currentUser = await User.findById(req.user._id);
    const usersWithFollowStatus = users.map((user) => {
      const userObj = user.toObject();
      userObj.isFollowing = currentUser.following.includes(user._id);
      userObj.isFollowedBy = currentUser.followers.includes(user._id);
      userObj.followersCount = user.followers.length;
      userObj.followingCount = user.following.length;
      return userObj;
    });

    res.json({
      success: true,
      data: {
        users: usersWithFollowStatus,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
        searchQuery: searchQuery,
        filter: filter,
      },
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching users",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Follow a user
// @route   POST /api/users/follow/:userId
// @access  Private
const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);

    if (!userToFollow || !userToFollow.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (userToFollow._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    const currentUser = await User.findById(req.user._id);

    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user",
      });
    }

    // Add to following list
    currentUser.following.push(userToFollow._id);
    await currentUser.save();

    // Add to user's followers list
    userToFollow.followers.push(req.user._id);
    await userToFollow.save();

    res.json({
      success: true,
      message: `You are now following ${userToFollow.firstName} ${userToFollow.lastName}`,
      data: {
        isFollowing: true,
        followersCount: userToFollow.followers.length,
      },
    });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({
      success: false,
      message: "Error following user",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/follow/:userId
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);

    if (!userToUnfollow || !userToUnfollow.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentUser = await User.findById(req.user._id);

    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString()
    );
    await currentUser.save();

    // Remove from user's followers list
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await userToUnfollow.save();

    res.json({
      success: true,
      message: `You have unfollowed ${userToUnfollow.firstName} ${userToUnfollow.lastName}`,
      data: {
        isFollowing: false,
        followersCount: userToUnfollow.followers.length,
      },
    });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({
      success: false,
      message: "Error unfollowing user",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get user's followers
// @route   GET /api/users/followers
// @access  Private
const getFollowers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id);
    const followers = await User.find({
      _id: { $in: currentUser.followers },
    })
      .select("username firstName lastName bio profilePicture")
      .limit(limit)
      .skip(skip);

    const total = currentUser.followers.length;

    res.json({
      success: true,
      data: {
        followers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalFollowers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching followers",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get user's following
// @route   GET /api/users/following
// @access  Private
const getFollowing = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id);
    const following = await User.find({
      _id: { $in: currentUser.following },
    })
      .select("username firstName lastName bio profilePicture")
      .limit(limit)
      .skip(skip);

    const total = currentUser.following.length;

    res.json({
      success: true,
      data: {
        following,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalFollowing: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching following",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Check if current user is following another user
// @route   GET /api/users/:userId/follow-status
// @access  Private
const checkFollowStatus = async (req, res) => {
  try {
    const userToCheck = await User.findById(req.params.userId);

    if (!userToCheck || !userToCheck.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.includes(userToCheck._id);

    res.json({
      success: true,
      data: {
        isFollowing,
        followersCount: userToCheck.followers.length,
        followingCount: userToCheck.following.length,
      },
    });
  } catch (error) {
    console.error("Check follow status error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking follow status",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get posts for a specific user
// @route   GET /api/users/:userId/posts
// @access  Public
const getUserPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const posts = await Post.find({
      user: req.params.userId,
      isPublic: true,
      isActive: true,
    })
      .populate("user", "username firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Post.countDocuments({
      user: req.params.userId,
      isPublic: true,
      isActive: true,
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user posts",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete user's posts
    await Post.deleteMany({ user: req.user._id });

    // Delete user's chats and messages
    await Chat.deleteMany({ participants: req.user._id });
    await Message.deleteMany({ sender: req.user._id });

    // Delete user's notifications
    await Notification.deleteMany({ recipient: req.user._id });

    // Delete user's requests
    await Request.deleteMany({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
    });

    // Remove user from other users' followers/following lists
    await User.updateMany(
      { followers: req.user._id },
      { $pull: { followers: req.user._id } }
    );
    await User.updateMany(
      { following: req.user._id },
      { $pull: { following: req.user._id } }
    );
    await User.updateMany(
      { friends: req.user._id },
      { $pull: { friends: req.user._id } }
    );

    // Delete the user account
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile/picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
  try {
    // For now, this is a placeholder. In a real implementation,
    // you would handle file upload to a service like AWS S3 or Cloudinary
    const { profilePicture } = req.body;

    if (!profilePicture) {
      return res.status(400).json({
        success: false,
        message: "Profile picture is required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    res.json({
      success: true,
      message: "Profile picture updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading profile picture",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get a specific user's followers
// @route   GET /api/users/:userId/followers
// @access  Public
const getUserFollowers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const followers = await User.find({
      _id: { $in: user.followers },
    })
      .select("username firstName lastName bio profilePicture")
      .limit(limit)
      .skip(skip);

    const total = user.followers.length;

    res.json({
      success: true,
      data: {
        followers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalFollowers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get user followers error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user followers",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get a specific user's following
// @route   GET /api/users/:userId/following
// @access  Public
const getUserFollowing = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.params.userId);
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const following = await User.find({
      _id: { $in: user.following },
    })
      .select("username firstName lastName bio profilePicture")
      .limit(limit)
      .skip(skip);

    const total = user.following.length;

    res.json({
      success: true,
      data: {
        following,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalFollowing: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get user following error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user following",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getUserByUsername,
  getUserPosts,
  deleteAccount,
  uploadProfilePicture,
  getUserFollowers,
  getUserFollowing,
};
