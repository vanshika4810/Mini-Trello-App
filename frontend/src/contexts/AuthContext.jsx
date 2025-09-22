import React, { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
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

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios defaults
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      if (state.token) {
        try {
          const res = await axios.get("http://localhost:5000/api/auth/me");
          dispatch({
            type: "AUTH_SUCCESS",
            payload: {
              user: res.data.user,
              token: state.token,
            },
          });
        } catch (error) {
          localStorage.removeItem("token");
          dispatch({ type: "AUTH_FAILURE", payload: "Token expired" });
        }
      } else {
        dispatch({ type: "AUTH_FAILURE", payload: null });
      }
    };

    loadUser();
  }, [state.token]);

  const register = async (userData) => {
    dispatch({ type: "AUTH_START" });
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        userData
      );
      localStorage.setItem("token", res.data.token);
      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: res.data.user,
          token: res.data.token,
        },
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      return { success: false, error: message };
    }
  };

  const login = async (userData) => {
    dispatch({ type: "AUTH_START" });
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        userData
      );
      localStorage.setItem("token", res.data.token);
      dispatch({
        type: "AUTH_SUCCESS",
        payload: {
          user: res.data.user,
          token: res.data.token,
        },
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      dispatch({ type: "AUTH_FAILURE", payload: message });
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value = {
    ...state,
    register,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
