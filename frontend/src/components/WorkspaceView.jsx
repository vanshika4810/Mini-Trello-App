import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
  Activity,
} from "lucide-react";
import List from "./List";
import CreateList from "./CreateList";
import AddMembers from "./InviteMembers";
import UserCursor from "./UserCursor";
import SearchFilter from "./SearchFilter";
import ActivityFeed from "./ActivityFeed";

const WorkspaceView = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const {
    currentWorkspace,
    getWorkspace,
    loading,
    error,
    moveCard,
    reorderCards,
    reorderLists,
    editList,
  } = useWorkspace();
  const { user, logout } = useAuth();
  const {
    socket,
    connected,
    onlineUsers,
    joinWorkspace,
    leaveWorkspace,
    emitCursorMove,
  } = useSocket();
  const [isLoading, setIsLoading] = useState(true);
  const [movingCard, setMovingCard] = useState(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [activeList, setActiveList] = useState(null);
  const [userCursors, setUserCursors] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // Socket.io real-time event listeners
  useEffect(() => {
    if (socket && connected && workspaceId) {
      // Join workspace room
      joinWorkspace(workspaceId);

      // Create event handlers
      const handleCardMoved = (data) => {
        console.log("Real-time card moved:", data);
        // Refresh workspace for all users
        getWorkspace(workspaceId);
      };

      const handleCardsReordered = (data) => {
        console.log("Real-time cards reordered:", data);
        // Refresh workspace for all users
        getWorkspace(workspaceId);
      };

      const handleCardUpdated = (data) => {
        console.log("Real-time card updated:", data);
        // Refresh workspace for all users
        getWorkspace(workspaceId);
      };

      const handleListUpdated = (data) => {
        console.log("Real-time list updated:", data);
        console.log("Current user ID:", user?.id, "Data user ID:", data.userId);
        // Refresh workspace for all users
        console.log("Refreshing workspace due to list update");
        getWorkspace(workspaceId);
      };

      const handleCardCreated = (data) => {
        console.log("Real-time card created:", data);
        // Refresh workspace for all users
        getWorkspace(workspaceId);
      };

      const handleCardDeleted = (data) => {
        console.log("Real-time card deleted:", data);
        // Refresh workspace for all users
        getWorkspace(workspaceId);
      };

      const handleListCreated = (data) => {
        console.log("Real-time list created:", data);
        // Refresh workspace for all users
        getWorkspace(workspaceId);
      };

      const handleListDeleted = (data) => {
        console.log("Real-time list deleted:", data);
        // Refresh workspace for all users
        getWorkspace(workspaceId);
      };

      const handleCursorMove = (data) => {
        console.log("Cursor move received:", data);
        if (data.userId !== user?.id) {
          setUserCursors((prev) => ({
            ...prev,
            [data.userId]: {
              x: data.x,
              y: data.y,
              userName: data.userName || "Unknown User",
              userId: data.userId,
              lastSeen: Date.now(),
            },
          }));
        }
      };

      // Add event listeners
      socket.on("card-moved", handleCardMoved);
      socket.on("cards-reordered", handleCardsReordered);
      socket.on("card-updated", handleCardUpdated);
      socket.on("list-updated", handleListUpdated);
      socket.on("card-created", handleCardCreated);
      socket.on("card-deleted", handleCardDeleted);
      socket.on("list-created", handleListCreated);
      socket.on("list-deleted", handleListDeleted);
      socket.on("cursor-move", handleCursorMove);

      // Cleanup on unmount
      return () => {
        console.log("Cleaning up workspace socket listeners");
        leaveWorkspace(workspaceId);
        socket.off("card-moved", handleCardMoved);
        socket.off("cards-reordered", handleCardsReordered);
        socket.off("card-updated", handleCardUpdated);
        socket.off("list-updated", handleListUpdated);
        socket.off("card-created", handleCardCreated);
        socket.off("card-deleted", handleCardDeleted);
        socket.off("list-created", handleListCreated);
        socket.off("list-deleted", handleListDeleted);
        socket.off("cursor-move", handleCursorMove);
      };
    }
  }, [socket, connected, workspaceId, user?.id]); // Simplified dependencies

  // Mouse movement tracking for cursor sharing
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (socket && connected && workspaceId) {
        emitCursorMove({
          workspaceId: workspaceId,
          x: e.clientX,
          y: e.clientY,
        });
      }
    };

    // Clean up old cursors (remove cursors not seen for 5 seconds)
    const cleanupInterval = setInterval(() => {
      setUserCursors((prev) => {
        const now = Date.now();
        const cleaned = {};
        Object.entries(prev).forEach(([userId, cursor]) => {
          if (now - cursor.lastSeen < 5000) {
            // 5 seconds
            cleaned[userId] = cursor;
          }
        });
        return cleaned;
      });
    }, 1000);

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      clearInterval(cleanupInterval);
    };
  }, [socket, connected, workspaceId, emitCursorMove]);

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

  const handleListEdit = async (listId, newTitle) => {
    try {
      const result = await editList(listId, newTitle, workspaceId);
      if (!result.success) {
        console.error("Failed to edit list:", result.error);
        alert("Failed to update list title. Please try again.");
      }
    } catch (error) {
      console.error("Error editing list:", error);
      alert("Failed to update list title. Please try again.");
    }
  };

  const handleAddMembers = () => {
    setIsAddingMembers(true);
  };

  const handleMemberAdded = async (updatedWorkspace) => {
    // Refresh the workspace to get updated member information
    await getWorkspace(workspaceId);
    setIsAddingMembers(false);
  };

  const handleCloseAddMembers = () => {
    setIsAddingMembers(false);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsSearchMode(true);
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setIsSearchMode(false);
  };

  // Helper function to check if current user is admin or owner
  const isUserAdminOrOwner = () => {
    if (!currentWorkspace || !user) return false;

    // Check if user is the owner
    if (currentWorkspace.owner && currentWorkspace.owner._id === user.id) {
      return true;
    }

    // Check if user has admin role
    const userMember = currentWorkspace.members?.find(
      (member) => member.user._id === user.id
    );
    return userMember?.role === "admin";
  };

  const handleDragStart = (event) => {
    const { active } = event;

    // Check if dragging a card or a list
    const isCard = currentWorkspace.lists?.some((list) =>
      list.cards?.some((card) => card._id === active.id)
    );

    if (isCard) {
      setActiveCard(active);
    } else {
      // It's a list
      setActiveList(active);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCard(null);
    setActiveList(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    console.log("Drag end - Active ID:", activeId, "Over ID:", overId);

    // Check if we're dragging a list or a card
    const isDraggingList = currentWorkspace.lists?.some(
      (list) => list._id === activeId
    );

    console.log("Is dragging list:", isDraggingList);

    if (isDraggingList) {
      // Handle list reordering
      const sourceIndex = currentWorkspace.lists.findIndex(
        (list) => list._id === activeId
      );
      const targetIndex = currentWorkspace.lists.findIndex(
        (list) => list._id === overId
      );

      console.log(
        "List reorder - Source index:",
        sourceIndex,
        "Target index:",
        targetIndex
      );

      if (sourceIndex !== targetIndex) {
        const newListOrder = arrayMove(
          currentWorkspace.lists,
          sourceIndex,
          targetIndex
        );
        const listIds = newListOrder.map((list) => list._id);

        console.log("New list order:", listIds);

        try {
          const result = await reorderLists(workspaceId, listIds);
          console.log("Reorder lists result:", result);
          if (!result.success) {
            console.error("Failed to reorder lists:", result.error);
          }
        } catch (error) {
          console.error("Error reordering lists:", error);
        }
      }
      return;
    }

    // Handle card drag and drop (existing logic)
    console.log("Handling card drag and drop");

    // Find the source list and card
    let sourceList = null;
    let sourceCard = null;

    for (const list of currentWorkspace.lists || []) {
      const card = list.cards?.find((c) => c._id === activeId);
      if (card) {
        sourceList = list;
        sourceCard = card;
        break;
      }
    }

    console.log(
      "Source list:",
      sourceList?.title,
      "Source card:",
      sourceCard?.title
    );

    if (!sourceList || !sourceCard) {
      console.log("No source list or card found");
      return;
    }

    // Check if dropping on a list or a card
    const isOverList = currentWorkspace.lists.some(
      (list) => list._id === overId
    );
    const isOverCard = currentWorkspace.lists.some((list) =>
      list.cards?.some((card) => card._id === overId)
    );

    if (isOverList) {
      // Dropping on a list
      const targetList = currentWorkspace.lists.find(
        (list) => list._id === overId
      );
      if (targetList && targetList._id !== sourceList._id) {
        // Moving to different list
        const newPosition = targetList.cards?.length || 0;
        console.log("Moving card to list - New position:", newPosition);
        try {
          const result = await moveCard(
            activeId,
            overId,
            newPosition,
            workspaceId
          );
          console.log("Move card to list result:", result);
          if (!result.success) {
            console.error("Failed to move card:", result.error);
          }
        } catch (error) {
          console.error("Error moving card:", error);
        }
      }
    } else if (isOverCard) {
      // Dropping on a card
      let targetList = null;
      let targetCard = null;

      for (const list of currentWorkspace.lists || []) {
        const card = list.cards?.find((c) => c._id === overId);
        if (card) {
          targetList = list;
          targetCard = card;
          break;
        }
      }

      if (!targetList || !targetCard) return;

      if (targetList._id === sourceList._id) {
        // Reordering within same list
        const sourceIndex = sourceList.cards.findIndex(
          (c) => c._id === activeId
        );
        const targetIndex = sourceList.cards.findIndex((c) => c._id === overId);

        if (sourceIndex !== targetIndex) {
          const newCardOrder = arrayMove(
            sourceList.cards,
            sourceIndex,
            targetIndex
          );
          const cardIds = newCardOrder.map((card) => card._id);
          console.log("Reordering cards in same list - Card IDs:", cardIds);
          try {
            const result = await reorderCards(
              sourceList._id,
              cardIds,
              workspaceId
            );
            console.log("Reorder cards result:", result);
            if (!result.success) {
              console.error("Failed to reorder cards:", result.error);
            }
          } catch (error) {
            console.error("Error reordering cards:", error);
          }
        }
      } else {
        // Moving to different list
        const targetIndex = targetList.cards.findIndex((c) => c._id === overId);
        console.log(
          "Moving card to different list - Target index:",
          targetIndex
        );
        try {
          const result = await moveCard(
            activeId,
            targetList._id,
            targetIndex,
            workspaceId
          );
          console.log("Move card result:", result);
          if (!result.success) {
            console.error("Failed to move card:", result.error);
          }
        } catch (error) {
          console.error("Error moving card:", error);
        }
      }
    }
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

                {/* Add Members Button (only for private workspaces) */}
                {isUserAdminOrOwner() && (
                  <button
                    onClick={handleAddMembers}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <User className="h-4 w-4 mr-1" />
                    Add Members
                  </button>
                )}
              </div>

              {/* Online Users Indicator */}
              {connected && onlineUsers.length > 0 && (
                <div className="flex items-center space-x-1 mr-4">
                  <div className="flex -space-x-2">
                    {onlineUsers.slice(0, 3).map((onlineUser) => (
                      <div
                        key={onlineUser.userId}
                        className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                        title={onlineUser.userName || "Unknown User"}
                      >
                        {(onlineUser.userName || "U").charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {onlineUsers.length > 3 && (
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                        +{onlineUsers.length - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {onlineUsers.length} online
                  </span>
                </div>
              )}

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

      <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Filter and Activity Feed - Top Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <SearchFilter
                workspaceId={workspaceId}
                onSearchResults={handleSearchResults}
                onClearSearch={handleClearSearch}
              />
            </div>
            <button
              onClick={() => setShowActivityFeed(!showActivityFeed)}
              className={`flex items-center px-4 py-5.5 rounded-lg border transition-colors ${
                showActivityFeed
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Activity className="h-4 w-4 mr-2" />
              {showActivityFeed ? "Hide Activity" : "Show Activity"}
            </button>
          </div>

          {/* Activity Feed Display - Below Search Filter */}
          {showActivityFeed && (
            <div className="w-full">
              <ActivityFeed workspaceId={workspaceId} />
            </div>
          )}
        </div>

        {/* Search Results Display - Full Width */}
        {isSearchMode && (
          <div className="mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Search Results
                </h3>
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear Search
                </button>
              </div>
              {searchResults.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No cards found matching your search criteria.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchResults.map((card) => (
                    <div
                      key={card._id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-medium text-gray-900 text-sm mb-1">
                        {card.title}
                      </h4>
                      {card.description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {card.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {card.listId?.title || "Unknown List"}
                        </span>
                        {card.assignedTo && <span>{card.assignedTo.name}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentWorkspace.lists?.map((list) => list._id) || []}
            strategy={verticalListSortingStrategy}
          >
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
                      onListEdit={handleListEdit}
                    />
                  ))}
                </>
              )}
              <CreateList
                workspaceId={workspaceId}
                onListCreated={handleListCreated}
              />
            </div>
          </SortableContext>
          <DragOverlay>
            {activeCard ? (
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg opacity-90">
                <h4 className="font-medium text-gray-900 text-sm">
                  {
                    currentWorkspace.lists
                      ?.flatMap((list) => list.cards || [])
                      .find((card) => card._id === activeCard.id)?.title
                  }
                </h4>
              </div>
            ) : activeList ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-80 opacity-90">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {
                          currentWorkspace.lists?.find(
                            (list) => list._id === activeList.id
                          )?.title
                        }
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="p-4 min-h-96">
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Dragging list...</p>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
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

      {/* Add Members Modal */}
      {isAddingMembers && (
        <AddMembers
          workspace={currentWorkspace}
          onClose={handleCloseAddMembers}
          onMemberAdded={handleMemberAdded}
        />
      )}

      {/* User Cursors */}
      {Object.values(userCursors).map((cursor) => (
        <UserCursor
          key={cursor.userId}
          user={cursor}
          x={cursor.x}
          y={cursor.y}
          isVisible={true}
        />
      ))}
    </div>
  );
};

export default WorkspaceView;
