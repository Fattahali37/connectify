import React, { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  Trash2,
  X,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Post({ post, onPostUpdate, onPostDelete, currentUser }) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [commentCount, setCommentCount] = useState(post.comments?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [commentSuccess, setCommentSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLike = async () => {
    try {
      let response;
      if (isLiked) {
        response = await api.unlikePost(post._id);
      } else {
        response = await api.likePost(post._id);
      }

      setIsLiked(!isLiked);
      setLikeCount(response.data.likeCount);

      // Update the post in parent component
      if (onPostUpdate) {
        onPostUpdate(post._id, {
          isLiked: !isLiked,
          likes: response.data.likeCount,
        });
      }

      // Update local state for immediate UI update
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    // Validate comment length
    if (commentText.trim().length < 1) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    if (commentText.trim().length > 500) {
      setCommentError(
        "Comment cannot exceed 500 characters. Please shorten your comment."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.addComment(post._id, commentText);
      setCommentText("");
      setCommentError("");
      setCommentSuccess(true); // Set success state
      setCommentCount(response.data.commentCount);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setCommentSuccess(false);
      }, 3000);

      // Update the post in parent component
      if (onPostUpdate) {
        onPostUpdate(post._id, {
          comments: [...(post.comments || []), response.data.comment],
          commentCount: response.data.commentCount,
        });
      }

      // Update local state for immediate UI update
      setCommentCount(response.data.commentCount);
    } catch (error) {
      console.error("Error adding comment:", error);
      setCommentError(
        error.message || "Failed to post comment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const response = await api.deleteComment(post._id, commentId);
        setCommentCount(response.data.commentCount);

        // Update the post in parent component
        if (onPostUpdate) {
          onPostUpdate(post._id, {
            comments: post.comments.filter((c) => c._id !== commentId),
            commentCount: response.data.commentCount,
          });
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await api.deletePost(post._id);
        if (onPostDelete) {
          onPostDelete(post._id);
        }
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
    setShowOptions(false);
  };

  const handleProfileClick = () => {
    navigate(`/user/${post.user.username}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className="bg-gray-900 rounded-xl mb-6 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
      data-post-id={post._id}
    >
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div
          className="flex items-center cursor-pointer group"
          onClick={handleProfileClick}
        >
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
            {post.user.profilePicture ? (
              <img
                src={post.user.profilePicture}
                alt={`${post.user.firstName} ${post.user.lastName}`}
                className="w-10 h-10 rounded-full object-cover group-hover:scale-110 transition-transform duration-200"
              />
            ) : (
              <User className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div className="ml-3">
            <span className="font-medium text-white group-hover:text-purple-400 transition-colors">
              {post.user.firstName} {post.user.lastName}
            </span>
            <p className="text-gray-400 text-sm">@{post.user.username}</p>
          </div>
        </div>

        <div className="relative">
          <button
            className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
            onClick={() => setShowOptions(!showOptions)}
            aria-label="Post options"
          >
            <MoreHorizontal size={20} />
          </button>

          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                {currentUser && currentUser._id === post.user._id && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-700 transition-colors"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Post
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="relative">
          <img
            src={post.image}
            alt="Post content"
            className="w-full aspect-square object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Post Content */}
      <div className="p-4">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`transition-all duration-200 flex items-center space-x-2 hover:scale-110 ${
                isLiked ? "text-red-500" : "text-white hover:text-red-500"
              }`}
              aria-label={isLiked ? "Unlike post" : "Like post"}
            >
              <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
              {likeCount > 0 && (
                <span className="text-sm text-gray-400">({likeCount})</span>
              )}
            </button>

            <button
              onClick={() => {
                setShowComments(!showComments);
                if (!showComments) {
                  // Focus on comment input when showing comments
                  setTimeout(() => {
                    const commentInput = document.querySelector(
                      `[data-post-id="${post._id}"] input[type="text"]`
                    );
                    if (commentInput) {
                      commentInput.focus();
                    }
                  }, 100);
                }
              }}
              className="text-white hover:text-gray-300 transition-all duration-200 flex items-center space-x-2 hover:scale-110"
              aria-label="Show comments"
            >
              <MessageCircle size={24} />
              {commentCount > 0 && (
                <span className="text-sm text-gray-400">({commentCount})</span>
              )}
            </button>

            <button
              className="text-white hover:text-gray-300 transition-all duration-200 hover:scale-110"
              aria-label="Share post"
            >
              <Share2 size={24} />
            </button>
          </div>
        </div>

        {/* Like Count */}
        <div className="text-sm mb-2">
          <span className="font-bold text-white">
            {likeCount.toLocaleString()}
          </span>{" "}
          likes
          {commentCount > 0 && (
            <span className="ml-4 text-gray-400">
              <span className="font-bold">{commentCount.toLocaleString()}</span>{" "}
              comments
            </span>
          )}
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="mb-2 text-white">
            <span
              className="font-bold mr-2 cursor-pointer hover:text-purple-400 transition-colors"
              onClick={handleProfileClick}
            >
              {post.user.firstName} {post.user.lastName}
            </span>
            {post.caption}
          </p>
        )}

        {/* Comments Preview */}
        {post.comments && post.comments.length > 0 && (
          <div className="mb-2">
            {showComments ? (
              // Show all comments
              <div className="space-y-2">
                {post.comments.map((comment, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between group p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <p className="text-sm flex-1 text-white">
                      <span
                        className="font-bold cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() =>
                          navigate(`/user/${comment.user.username}`)
                        }
                      >
                        {comment.user.firstName} {comment.user.lastName}
                      </span>
                      <span className="ml-2">{comment.text}</span>
                    </p>
                    {currentUser && currentUser._id === comment.user._id && (
                      <button
                        onClick={() => handleCommentDelete(comment._id)}
                        className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2 p-1 rounded hover:bg-gray-700"
                        title="Delete comment"
                        aria-label="Delete comment"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setShowComments(false)}
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  Hide comments
                </button>
              </div>
            ) : (
              // Show preview of comments
              <>
                {post.comments.slice(0, 2).map((comment, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between group p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <p className="text-sm flex-1 text-white">
                      <span
                        className="font-bold cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() =>
                          navigate(`/user/${comment.user.username}`)
                        }
                      >
                        {comment.user.firstName} {comment.user.lastName}
                      </span>
                      <span className="ml-2">{comment.text}</span>
                    </p>
                    {currentUser && currentUser._id === comment.user._id && (
                      <button
                        onClick={() => handleCommentDelete(comment._id)}
                        className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2 p-1 rounded hover:bg-gray-700"
                        title="Delete comment"
                        aria-label="Delete comment"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {post.comments.length > 2 && (
                  <button
                    onClick={() => setShowComments(true)}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    View all {post.comments.length} comments
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-gray-400 text-xs mt-2">
          {formatDate(post.createdAt)}
        </p>

        {/* Comment Input */}
        <div className="mt-4 border-t border-gray-800 pt-4">
          <div className="space-y-3">
            <form onSubmit={handleComment} className="space-y-3">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCommentText(value);
                    if (commentError) setCommentError("");
                    if (commentSuccess) setCommentSuccess(false); // Clear success state on new input

                    // Clear error if input is valid
                    if (value.trim().length > 0 && value.trim().length <= 500) {
                      setCommentError("");
                    }
                  }}
                  onFocus={() => {
                    if (commentError) setCommentError("");
                    if (commentSuccess) setCommentSuccess(false);
                  }}
                  placeholder={`Write a comment as ${
                    currentUser?.firstName || "you"
                  }... (max 500 characters)`}
                  className={`flex-1 px-3 py-2 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200 ${
                    commentError
                      ? "border-red-500"
                      : commentText.length > 450
                      ? "border-yellow-500"
                      : "border-gray-700"
                  } ${commentText.length > 0 ? "bg-gray-700" : "bg-gray-800"}`}
                  disabled={isSubmitting}
                  maxLength={500}
                  aria-label="Comment input"
                />
                <button
                  type="submit"
                  disabled={
                    !commentText.trim() ||
                    isSubmitting ||
                    commentText.trim().length > 500
                  }
                  className={`px-4 py-2 rounded-lg text-white transition-all duration-200 flex items-center justify-center space-x-2 min-w-[120px] ${
                    isSubmitting
                      ? "bg-gray-600 cursor-not-allowed"
                      : !commentText.trim() || commentText.trim().length > 500
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 hover:scale-105 transform"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span className="hidden sm:inline">Post</span>
                    </>
                  )}
                </button>
              </div>

              {/* Status Messages */}
              {commentError && (
                <div className="text-red-400 text-xs text-center bg-red-900 bg-opacity-20 border border-red-500 rounded-lg px-3 py-2 flex items-center justify-center space-x-2">
                  <span>⚠️</span>
                  <span>{commentError}</span>
                </div>
              )}
              {commentSuccess && (
                <div className="text-green-400 text-xs text-center bg-green-900 bg-opacity-20 border border-green-500 rounded-lg px-3 py-2 flex items-center justify-center space-x-2">
                  <span>✅</span>
                  <span>Comment posted successfully! 🎉</span>
                </div>
              )}

              {/* Character Counter */}
              {commentText.length > 0 && (
                <div className="text-right">
                  <span
                    className={`text-xs font-medium ${
                      commentText.length > 450
                        ? "text-red-400"
                        : commentText.length > 400
                        ? "text-yellow-400"
                        : commentText.length > 300
                        ? "text-blue-400"
                        : "text-gray-400"
                    }`}
                  >
                    {commentText.length}/500 characters
                    {commentText.length > 450 && (
                      <span className="ml-1">⚠️</span>
                    )}
                  </span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Post;
