import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const WorkspaceContext = createContext();

const initialState = {
  workspaces: [],
  currentWorkspace: null,
  loading: false,
  error: null,
};

const workspaceReducer = (state, action) => {
  switch (action.type) {
    case "WORKSPACE_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "CREATE_WORKSPACE_SUCCESS":
      return {
        ...state,
        workspaces: [...state.workspaces, action.payload],
        loading: false,
        error: null,
      };
    case "GET_WORKSPACES_SUCCESS":
      return {
        ...state,
        workspaces: action.payload,
        loading: false,
        error: null,
      };
    case "GET_WORKSPACE_SUCCESS":
      return {
        ...state,
        currentWorkspace: action.payload,
        loading: false,
        error: null,
      };
    case "UPDATE_WORKSPACE_SUCCESS":
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) =>
          workspace._id === action.payload._id ? action.payload : workspace
        ),
        currentWorkspace:
          state.currentWorkspace?._id === action.payload._id
            ? action.payload
            : state.currentWorkspace,
        loading: false,
        error: null,
      };
    case "WORKSPACE_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const WorkspaceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(workspaceReducer, initialState);

  const createWorkspace = useCallback(async (workspaceData) => {
    dispatch({ type: "WORKSPACE_START" });
    try {
      const res = await axios.post(
        "http://localhost:5000/api/workspaces",
        workspaceData
      );
      dispatch({
        type: "CREATE_WORKSPACE_SUCCESS",
        payload: res.data.workspace,
      });
      return { success: true, workspace: res.data.workspace };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create workspace";
      dispatch({ type: "WORKSPACE_FAILURE", payload: message });
      return { success: false, error: message };
    }
  }, []);

  const getWorkspaces = useCallback(async () => {
    dispatch({ type: "WORKSPACE_START" });
    try {
      const res = await axios.get("http://localhost:5000/api/workspaces");
      dispatch({
        type: "GET_WORKSPACES_SUCCESS",
        payload: res.data.workspaces,
      });
      return { success: true, workspaces: res.data.workspaces };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch workspaces";
      dispatch({ type: "WORKSPACE_FAILURE", payload: message });
      return { success: false, error: message };
    }
  }, []);

  const getWorkspace = useCallback(async (workspaceId) => {
    dispatch({ type: "WORKSPACE_START" });
    try {
      const res = await axios.get(
        `http://localhost:5000/api/workspaces/${workspaceId}`
      );
      dispatch({ type: "GET_WORKSPACE_SUCCESS", payload: res.data.workspace });
      return { success: true, workspace: res.data.workspace };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch workspace";
      dispatch({ type: "WORKSPACE_FAILURE", payload: message });
      return { success: false, error: message };
    }
  }, []);

  const updateWorkspace = useCallback(async (workspaceId, updateData) => {
    dispatch({ type: "WORKSPACE_START" });
    try {
      const res = await axios.put(
        `http://localhost:5000/api/workspaces/${workspaceId}`,
        updateData
      );
      dispatch({
        type: "UPDATE_WORKSPACE_SUCCESS",
        payload: res.data.workspace,
      });
      return { success: true, workspace: res.data.workspace };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update workspace";
      dispatch({ type: "WORKSPACE_FAILURE", payload: message });
      return { success: false, error: message };
    }
  }, []);

  const moveCard = useCallback(
    async (cardId, targetListId, newPosition, workspaceId) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `http://localhost:5000/api/cards/${cardId}/move`,
          {
            targetListId,
            newPosition,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Refresh the workspace to get updated data for cross-list moves
        if (workspaceId) {
          try {
            await getWorkspace(workspaceId);
          } catch (refreshError) {
            console.error(
              "Failed to refresh workspace after move:",
              refreshError
            );
          }
        }

        return { success: true, data: response.data };
      } catch (error) {
        const message = error.response?.data?.message || "Failed to move card";

        // If there's an error, refresh the workspace to get the correct state
        if (workspaceId) {
          try {
            await getWorkspace(workspaceId);
          } catch (refreshError) {
            console.error(
              "Failed to refresh workspace after move error:",
              refreshError
            );
          }
        }

        return { success: false, error: message };
      }
    },
    [getWorkspace]
  );

  const reorderCards = useCallback(
    async (listId, cardOrder, workspaceId) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `http://localhost:5000/api/cards/reorder`,
          {
            listId,
            cardOrder,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Refresh the workspace to get updated data from the database
        if (workspaceId) {
          try {
            await getWorkspace(workspaceId);
          } catch (refreshError) {
            console.error(
              "Failed to refresh workspace after reorder:",
              refreshError
            );
          }
        }

        return { success: true, data: response.data };
      } catch (error) {
        const message =
          error.response?.data?.message || "Failed to reorder cards";

        // If there's an error, refresh the workspace to get the correct state
        if (workspaceId) {
          try {
            await getWorkspace(workspaceId);
          } catch (refreshError) {
            console.error(
              "Failed to refresh workspace after reorder error:",
              refreshError
            );
          }
        }

        return { success: false, error: message };
      }
    },
    [getWorkspace]
  );

  const reorderLists = useCallback(
    async (workspaceId, listOrder) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `http://localhost:5000/api/workspaces/${workspaceId}/reorder-lists`,
          {
            listOrder,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Refresh the workspace to get updated data
        if (workspaceId) {
          try {
            await getWorkspace(workspaceId);
          } catch (refreshError) {
            console.error(
              "Failed to refresh workspace after list reorder:",
              refreshError
            );
          }
        }

        return { success: true, data: response.data };
      } catch (error) {
        const message =
          error.response?.data?.message || "Failed to reorder lists";

        // If there's an error, refresh the workspace to get the correct state
        if (workspaceId) {
          try {
            await getWorkspace(workspaceId);
          } catch (refreshError) {
            console.error(
              "Failed to refresh workspace after list reorder error:",
              refreshError
            );
          }
        }

        return { success: false, error: message };
      }
    },
    [getWorkspace]
  );

  const editList = useCallback(
    async (listId, title, workspaceId) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `http://localhost:5000/api/lists/${listId}`,
          {
            title,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Refresh the workspace to get updated data
        if (workspaceId) {
          try {
            await getWorkspace(workspaceId);
          } catch (refreshError) {
            console.error(
              "Failed to refresh workspace after list edit:",
              refreshError
            );
          }
        }

        return { success: true, data: response.data };
      } catch (error) {
        const message = error.response?.data?.message || "Failed to edit list";

        // If there's an error, refresh the workspace to get the correct state
        if (workspaceId) {
          try {
            await getWorkspace(workspaceId);
          } catch (refreshError) {
            console.error(
              "Failed to refresh workspace after list edit error:",
              refreshError
            );
          }
        }

        return { success: false, error: message };
      }
    },
    [getWorkspace]
  );

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value = {
    ...state,
    createWorkspace,
    getWorkspaces,
    getWorkspace,
    updateWorkspace,
    moveCard,
    reorderCards,
    reorderLists,
    editList,
    clearError,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
