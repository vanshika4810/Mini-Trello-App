import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowLeft,
  Settings,
  Users,
  Lock,
  Globe,
  Plus,
  X,
  User,
  LogOut,
} from "lucide-react";
import List from "./List";
import CreateList from "./CreateList";

const WorkspaceView = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { currentWorkspace, getWorkspace, loading, error } = useWorkspace();
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [movingCard, setMovingCard] = useState(null);
  const [isCreatingList, setIsCreatingList] = useState(false);

  useEffect(() => {
    const fetchWorkspace = async () => {
      setIsLoading(true);
      await getWorkspace(workspaceId);
      setIsLoading(false);
    };

    if (workspaceId) {
      fetchWorkspace();
    }
  }, [workspaceId, getWorkspace]);

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

  const handleCardCreated = async (newCard) => {
    await getWorkspace(workspaceId);
  };

  const handleCardEdit = (updatedCard) => {
    getWorkspace(workspaceId);
  };

  const handleCardDelete = async (card) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/cards/${card._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await getWorkspace(workspaceId);
      } else {
        const error = await response.json();
        console.error("Error deleting card:", error);
        alert("Failed to delete card. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      alert("Failed to delete card. Please try again.");
    }
  };

  const handleCardMove = (card) => {
    setMovingCard(card);
    console.log("Move card:", card);
  };

  const handleListCreated = async (newList) => {
    await getWorkspace(workspaceId);
  };

  const handleListDelete = async (listId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/lists/${listId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await getWorkspace(workspaceId);
      } else {
        const error = await response.json();
        console.error("Error deleting list:", error);
        alert("Failed to delete list. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting list:", error);
      alert("Failed to delete list. Please try again.");
    }
  };

  const handleCreateListFromNavbar = () => {
    setIsCreatingList(true);
  };

  const handleListCreatedFromNavbar = async (newList) => {
    await getWorkspace(workspaceId);
    setIsCreatingList(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Workspace
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Workspace Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The workspace you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentWorkspace.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    {getVisibilityIcon(currentWorkspace.visibility)}
                    <span className="ml-1">
                      {getVisibilityText(currentWorkspace.visibility)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{currentWorkspace.members?.length || 0} members</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCreateListFromNavbar}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add List
                </button>
              </div>

              {user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {currentWorkspace.lists && currentWorkspace.lists.length > 0 && (
            <>
              {currentWorkspace.lists.map((list) => (
                <List
                  key={list._id}
                  list={list}
                  onCardCreated={handleCardCreated}
                  onCardEdit={handleCardEdit}
                  onCardDelete={handleCardDelete}
                  onCardMove={handleCardMove}
                  onListDelete={handleListDelete}
                />
              ))}
            </>
          )}
          <CreateList
            workspaceId={workspaceId}
            onListCreated={handleListCreated}
          />
        </div>
      </div>

      {isCreatingList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Create New List
              </h3>
              <button
                onClick={() => setIsCreatingList(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <CreateList
                workspaceId={workspaceId}
                onListCreated={handleListCreatedFromNavbar}
                onCancel={() => setIsCreatingList(false)}
                showForm={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceView;
