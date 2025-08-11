const Post = require("../models/Post");
const User = require("../models/User");

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { caption, image, tags, location } = req.body;

    const post = await Post.create({
      user: req.user._id,
      caption,
      image,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      location,
    });

    // Populate user information
    await post.populate("user", "username firstName lastName profilePicture");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: {
        post: post.getPublicData(),
      },
    });
  } catch (error) {
    console.error("Create post error:", error);

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
      message: "Error creating post",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get all posts (for homepage)
// @route   GET /api/posts
// @access  Private
const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Get posts from users that the current user follows, plus their own posts
    const currentUser = await User.findById(req.user._id);
    const followingUsers = [...currentUser.following, req.user._id];

    let posts;
    let total;

    // If user has no posts and follows no one, show some public posts to get started
    if (followingUsers.length === 1 && currentUser.following.length === 0) {
      // Show some recent public posts from other users to help new users discover content
      posts = await Post.find({
        user: { $ne: req.user._id }, // Not the current user
        isPublic: true,
        isActive: true,
      })
        .populate("user", "username firstName lastName profilePicture")
        .populate("comments.user", "username firstName lastName profilePicture")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      total = await Post.countDocuments({
        user: { $ne: req.user._id },
        isPublic: true,
        isActive: true,
      });
    } else {
      // Normal feed for users with posts or following others
      posts = await Post.find({
        user: { $in: followingUsers },
        isPublic: true,
        isActive: true,
      })
        .populate("user", "username firstName lastName profilePicture")
        .populate("comments.user", "username firstName lastName profilePicture")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      total = await Post.countDocuments({
        user: { $in: followingUsers },
        isPublic: true,
        isActive: true,
      });
    }

    // Add like status for current user
    const postsWithLikeStatus = posts.map((post) => {
      const postObj = post.getPublicData();
      postObj.isLiked = post.isLikedBy(req.user._id);
      return postObj;
    });

    res.json({
      success: true,
      data: {
        posts: postsWithLikeStatus,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
        isNewUser:
          followingUsers.length === 1 && currentUser.following.length === 0,
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching posts",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get a single post
// @route   GET /api/posts/:id
// @access  Private
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username firstName lastName profilePicture")
      .populate("comments.user", "username firstName lastName profilePicture");

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user can view this post
    if (
      !post.isPublic &&
      post.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const postData = post.getPublicData();
    postData.isLiked = post.isLikedBy(req.user._id);

    res.json({
      success: true,
      data: {
        post: postData,
      },
    });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching post",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Like/Unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const wasLiked = post.toggleLike(req.user._id);
    await post.save();

    res.json({
      success: true,
      message: wasLiked ? "Post liked" : "Post unliked",
      data: {
        isLiked: !wasLiked,
        likeCount: post.likes.length,
      },
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling like",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Add comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const comment = post.addComment(req.user._id, text.trim());
    await post.save();

    // Populate the new comment with user info
    await post.populate(
      "comments.user",
      "username firstName lastName profilePicture"
    );

    res.json({
      success: true,
      message: "Comment added successfully",
      data: {
        comment: comment,
        commentCount: post.comments.length,
      },
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own posts.",
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({
      user: req.params.userId,
      isPublic: true,
      isActive: true,
    })
      .populate("user", "username firstName lastName profilePicture")
      .populate("comments.user", "username firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments({
      user: req.params.userId,
      isPublic: true,
      isActive: true,
    });

    // Add like status for current user
    const postsWithLikeStatus = posts.map((post) => {
      const postObj = post.getPublicData();
      postObj.isLiked = post.isLikedBy(req.user._id);
      return postObj;
    });

    res.json({
      success: true,
      data: {
        posts: postsWithLikeStatus,
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

module.exports = {
  createPost,
  getPosts,
  getPost,
  toggleLike,
  addComment,
  deletePost,
  getUserPosts,
};
