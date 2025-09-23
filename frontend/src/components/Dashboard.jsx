import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useWorkspace } from "../contexts/WorkspaceContext";
import Navbar from "./Navbar";
import CreateWorkspace from "./CreateWorkspace";
import WorkspaceCard from "./WorkspaceCard";
import { Plus, Calendar, CheckCircle, Kanban } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspaces, getWorkspaces, loading, error } = useWorkspace();
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);

  const handleVisibilityToggle = async (workspaceId, newVisibility) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/workspaces/${workspaceId}/visibility`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ visibility: newVisibility }),
        }
      );

      if (response.ok) {
        // Refresh the workspaces list
        await getWorkspaces();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update visibility");
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
      throw error;
    }
  };

  const handleDeleteWorkspace = async (workspaceId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/workspaces/${workspaceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Refresh the workspaces list
        await getWorkspaces();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete workspace");
      }
    } catch (error) {
      console.error("Error deleting workspace:", error);
      throw error;
    }
  };

  useEffect(() => {
    getWorkspaces();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-6">
          <div className="col-span-3">
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Your Workspaces
                  </h3>
                  <button
                    onClick={() => setIsCreateWorkspaceOpen(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Workspace
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Loading workspaces...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      Error loading workspaces
                    </h3>
                    <p className="text-sm text-gray-500">{error}</p>
                  </div>
                ) : workspaces.length === 0 ? (
                  <div className="text-center py-12">
                    <Kanban className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No workspaces yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating your first workspace.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setIsCreateWorkspaceOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Workspace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workspaces.map((workspace) => (
                      <WorkspaceCard
                        key={workspace._id}
                        workspace={workspace}
                        onClick={() => navigate(`/workspace/${workspace._id}`)}
                        onVisibilityToggle={handleVisibilityToggle}
                        onDelete={handleDeleteWorkspace}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-1 space-y-6">
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Kanban className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Workspaces
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {workspaces.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CreateWorkspace
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
