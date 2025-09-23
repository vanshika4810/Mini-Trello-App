import React, { useState } from "react";
import { Lock, Globe, Users, Calendar, Settings, Trash2 } from "lucide-react";

const WorkspaceCard = ({
  workspace,
  onClick,
  onVisibilityToggle,
  onDelete,
}) => {
  const [isChangingVisibility, setIsChangingVisibility] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getVisibilityIcon = (visibility) => {
    return visibility === "private" ? (
      <Lock className="h-4 w-4 text-gray-500" />
    ) : (
      <Globe className="h-4 w-4 text-gray-500" />
    );
  };

  const getVisibilityText = (visibility) => {
    return visibility === "private" ? "Private" : "Public";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleVisibilityToggle = async (e) => {
    e.stopPropagation();
    const newVisibility =
      workspace.visibility === "private" ? "public" : "private";

    if (
      window.confirm(
        `Are you sure you want to change this workspace's visibility to ${newVisibility}?`
      )
    ) {
      setIsChangingVisibility(true);
      try {
        await onVisibilityToggle(workspace._id, newVisibility);
      } catch (error) {
        console.error("Error changing visibility:", error);
        alert("Failed to change visibility. Please try again.");
      } finally {
        setIsChangingVisibility(false);
      }
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();

    if (
      window.confirm(
        `Are you sure you want to delete the workspace "${workspace.title}"? This action cannot be undone.`
      )
    ) {
      setIsDeleting(true);
      try {
        await onDelete(workspace._id);
      } catch (error) {
        console.error("Error deleting workspace:", error);
        alert("Failed to delete workspace. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3 cursor-default">
        <h3 className="text-lg font-medium text-gray-900 truncate pr-2">
          {workspace.title}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleVisibilityToggle}
            disabled={isChangingVisibility}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
            title="Change visibility"
          >
            <div className="flex items-center text-sm text-gray-500 underline">
              {getVisibilityIcon(workspace.visibility)}
              <span className="ml-1">
                {getVisibilityText(workspace.visibility)}
              </span>
            </div>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
            title="Delete workspace"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 cursor-default">
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          <span>{workspace.members?.length || 0} members</span>
        </div>

        {workspace.dueDate && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Due {formatDate(workspace.dueDate)}</span>
          </div>
        )}
      </div>

      <div
        className="mt-3 pt-3 border-t border-gray-100 cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center justify-between text-sm text-gray-500 hover:text-blue-500">
          <span className="hover:underline">Click to open</span>
          <span>→</span>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCard;
