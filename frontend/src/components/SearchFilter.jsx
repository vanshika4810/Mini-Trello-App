import React, { useState } from "react";
import { Search, X } from "lucide-react";

const SearchFilter = ({ workspaceId, onSearchResults, onClearSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!workspaceId) return;

    setIsSearching(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      const response = await fetch(
        `http://localhost:5000/api/search/workspace/${workspaceId}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        onSearchResults(data.cards || []);
      } else {
        console.error("Search failed");
        onSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching:", error);
      onSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    onClearSearch();
  };

  const hasActiveFilters = searchQuery.trim();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search cards by title or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? "Searching..." : "Search"}
        </button>

        {/* Clear Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearSearch}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;
