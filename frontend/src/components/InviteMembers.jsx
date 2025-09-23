import React, { useState, useEffect } from "react";
import { X, UserPlus, Search, User, Crown } from "lucide-react";
import axios from "axios";

const AddMembers = ({ workspace, onClose, onMemberAdded }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);

  // Search users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/workspaces/users/search?q=${encodeURIComponent(
            searchQuery
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSearchResults(response.data.users);
      } catch (error) {
        console.error("Error searching users:", error);
        setError("Failed to search users");
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAddMember = async () => {
    if (!selectedUser) return;

    setIsAdding(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/workspaces/${workspace._id}/members`,
        {
          email: selectedUser.email,
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onMemberAdded(response.data.workspace);
      onClose();
    } catch (error) {
      console.error("Error adding member:", error);
      setError(error.response?.data?.message || "Failed to add member");
    } finally {
      setIsAdding(false);
    }
  };

  const isUserAlreadyMember = (user) => {
    return workspace.members?.some((member) => member.user._id === user._id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add Members</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Search Results */}
          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Searching users...</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className={`p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                    isUserAlreadyMember(user)
                      ? "opacity-50 cursor-not-allowed"
                      : selectedUser?._id === user._id
                      ? "bg-blue-50"
                      : ""
                  }`}
                  onClick={() => {
                    if (!isUserAlreadyMember(user)) {
                      setSelectedUser(user);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {isUserAlreadyMember(user) && (
                      <span className="text-xs text-gray-500">
                        Already a member
                      </span>
                    )}
                    {selectedUser?._id === user._id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected User */}
          {selectedUser && !isUserAlreadyMember(selectedUser) && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedUser.name}
                  </p>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              {/* Role Selection */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="member"
                      checked={role === "member"}
                      onChange={(e) => setRole(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Member</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === "admin"}
                      onChange={(e) => setRole(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Admin</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Current Members */}
          {workspace.members && workspace.members.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Current Members ({workspace.members.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {workspace.members.map((member) => (
                  <div
                    key={member.user._id}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-900">{member.user.name}</span>
                    <span className="text-gray-500">({member.user.email})</span>
                    <div className="flex items-center space-x-1">
                      {member.role === "admin" && (
                        <Crown className="h-3 w-3 text-yellow-500" />
                      )}
                      <span className="text-xs text-gray-500 capitalize">
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleAddMember}
            disabled={
              !selectedUser || isAdding || isUserAlreadyMember(selectedUser)
            }
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Adding..." : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMembers;
