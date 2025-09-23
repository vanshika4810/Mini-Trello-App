import React, { useState, useEffect } from "react";
import { Activity, Clock, User, Plus, Edit, Trash, MessageCircle, Move } from "lucide-react";

const ActivityFeed = ({ workspaceId }) => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (workspaceId) {
      fetchActivities();
    }
  }, [workspaceId]);

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/activities/workspace/${workspaceId}?limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      } else {
        setError("Failed to fetch activities");
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setError("Failed to fetch activities");
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (action) => {
    if (action.includes("created")) return <Plus className="h-4 w-4 text-green-600" />;
    if (action.includes("updated") || action.includes("edited")) return <Edit className="h-4 w-4 text-blue-600" />;
    if (action.includes("deleted")) return <Trash className="h-4 w-4 text-red-600" />;
    if (action.includes("moved")) return <Move className="h-4 w-4 text-purple-600" />;
    if (action.includes("commented")) return <MessageCircle className="h-4 w-4 text-orange-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Activity className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-4">
          <Activity className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchActivities}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Activity className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
        </div>
        <button
          onClick={fetchActivities}
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No activities yet</p>
          <p className="text-sm text-gray-400">Activities will appear here as team members work on the board</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {activity.userId?.name || "Unknown User"}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{activity.action}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatTimestamp(activity.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
