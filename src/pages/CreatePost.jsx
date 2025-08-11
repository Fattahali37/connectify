import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image, Send, X, Loader2 } from "lucide-react";
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.caption.trim() && !formData.image.trim()) {
      setError("Please add a caption or image to create a post");
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
  };

  const isFormValid = formData.caption.trim() || formData.image.trim();

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Create Post</h1>
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded-lg text-center mb-6">
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
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image URL (Optional)
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="fun, lifestyle, tech (comma separated)"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              disabled={isSubmitting}
            />
            <p className="text-gray-400 text-sm mt-1">
              Separate tags with commas
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="New York, NY"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClear}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
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
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full max-h-96 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              )}
              {formData.caption && (
                <p className="text-white">{formData.caption}</p>
              )}
              {formData.tags && (
                <div className="flex flex-wrap gap-2 mt-3">
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
                <p className="text-gray-400 text-sm mt-3">
                  📍 {formData.location}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreatePost;
