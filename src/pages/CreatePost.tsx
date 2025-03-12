import React from 'react';
import { Image, Type, MapPin } from 'lucide-react';

function CreatePost() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Create New Post</h2>
        
        <form className="space-y-6">
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
            <Image className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400 mb-2">Drag photos and videos here</p>
            <button
              type="button"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
            >
              Select from computer
            </button>
          </div>

          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-gray-300 mb-2">
              Caption
            </label>
            <div className="relative">
              <Type className="absolute left-3 top-3 text-gray-400" size={20} />
              <textarea
                id="caption"
                rows={4}
                className="block w-full pl-10 pr-4 py-2 bg-gray-800 border-transparent rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-0"
                placeholder="Write a caption..."
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                id="location"
                className="block w-full pl-10 pr-4 py-2 bg-gray-800 border-transparent rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-0"
                placeholder="Add location"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium"
          >
            Share
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;