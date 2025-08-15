import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image, Send, X, Loader2, Camera, MapPin, Tag } from "lucide-react";
import api from "../services/api";

function CreatePost() {
  const [formData, setFormData] = useState({
    caption: "",
    image: "",
    tags: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (error) setError("");
    if (name === "image" && imageError) setImageError("");
  };

  const validateImage = (url) => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, image: url }));

    if (url && !validateImage(url)) {
      setImageError("Please enter a valid URL");
      setImagePreview(null);
    } else {
      setImageError("");
      if (url) {
        setImagePreview(url);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.caption.trim() && !formData.image.trim()) {
      setError("Please add a caption or image to create a post");
      return;
    }

    if (formData.image && !validateImage(formData.image)) {
      setError("Please enter a valid image URL");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Prepare post data
      const postData = {
        caption: formData.caption.trim(),
        image: formData.image.trim(),
        tags: formData.tags.trim(),
        location: formData.location.trim(),
      };

      // Remove empty fields
      Object.keys(postData).forEach((key) => {
        if (!postData[key]) delete postData[key];
      });

      await api.createPost(postData);

      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      setError(error.message || "Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      caption: "",
      image: "",
      tags: "",
      location: "",
    });
    setError("");
    setImageError("");
    setImagePreview(null);
  };

  const isFormValid =
    (formData.caption.trim() || formData.image.trim()) && !imageError;

  return (
    <div className="min-h-full bg-gray-900 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-900 rounded-xl p-4 lg:p-6 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Create Post
            </h1>
            <button
              onClick={() => navigate("/")}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-lg text-center mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Caption */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What's on your mind?
              </label>
              <textarea
                name="caption"
                value={formData.caption}
                onChange={handleChange}
                rows={4}
                placeholder="Share your thoughts, ideas, or experiences..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 resize-none transition-all duration-200"
                disabled={isSubmitting}
                maxLength={1000}
              />
              <div className="text-right mt-1">
                <span className="text-xs text-gray-400">
                  {formData.caption.length}/1000
                </span>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <Camera size={16} />
                  <span>Image URL (Optional)</span>
                </div>
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleImageChange}
                placeholder="https://example.com/image.jpg"
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
                  imageError
                    ? "border-red-500"
                    : "border-gray-700 focus:border-purple-500"
                }`}
                disabled={isSubmitting}
              />
              {imageError && (
                <p className="text-red-400 text-sm mt-1">{imageError}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <Tag size={16} />
                  <span>Tags (Optional)</span>
                </div>
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="fun, lifestyle, tech (comma separated)"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                disabled={isSubmitting}
              />
              <p className="text-gray-400 text-sm mt-1">
                Separate tags with commas to help others discover your post
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span>Location (Optional)</span>
                </div>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="New York, NY"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                disabled={isSubmitting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClear}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-all duration-200 disabled:opacity-50"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105 transform"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Create Post</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preview */}
          {(formData.caption || formData.image) && (
            <div className="mt-8 border-t border-gray-800 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
              <div className="bg-gray-800 rounded-lg p-4">
                {imagePreview && (
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-96 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = "none";
                        setImageError("Failed to load image");
                      }}
                    />
                  </div>
                )}
                {formData.caption && (
                  <p className="text-white mb-3">{formData.caption}</p>
                )}
                {formData.tags && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.split(",").map((tag, index) => (
                      <span
                        key={index}
                        className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
                {formData.location && (
                  <p className="text-gray-400 text-sm flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {formData.location}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
