import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      console.log(
        "Initializing socket with user:",
        user.name,
        "token:",
        token ? "present" : "missing"
      );

      // Initialize socket connection with authentication
      const newSocket = io("http://localhost:5000", {
        auth: {
          token: token,
        },
        forceNew: true, // Force new connection
        transports: ["websocket", "polling"], // Use both transports for better compatibility
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        setConnected(true);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setConnected(false);
        setOnlineUsers([]);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setConnected(false);
      });

      // Handle user presence events
      newSocket.on("user-joined", (data) => {
        console.log("User joined:", data);
        if (data && data.userId && data.userName) {
          setOnlineUsers((prev) => {
            const exists = prev.find((u) => u.userId === data.userId);
            if (!exists) {
              return [...prev, data];
            }
            return prev;
          });
        }
      });

      newSocket.on("user-left", (data) => {
        console.log("User left:", data);
        if (data && data.userId) {
          setOnlineUsers((prev) =>
            prev.filter((u) => u.userId !== data.userId)
          );
        }
      });

      setSocket(newSocket);

      return () => {
        console.log("Cleaning up socket connection");
        newSocket.disconnect();
        setSocket(null);
        setConnected(false);
        setOnlineUsers([]);
      };
    } else if (socket) {
      // If user logs out, disconnect socket
      socket.disconnect();
      setSocket(null);
      setConnected(false);
      setOnlineUsers([]);
    }
  }, [user?.id, token]); // Only depend on user ID and token, not the entire user object

  const joinWorkspace = (workspaceId) => {
    if (socket && connected) {
      socket.emit("join-workspace", workspaceId);
    }
  };

  const leaveWorkspace = (workspaceId) => {
    if (socket && connected) {
      socket.emit("leave-workspace", workspaceId);
    }
  };

  const emitCardMoved = (data) => {
    if (socket && connected) {
      socket.emit("card-moved", data);
    }
  };

  const emitCardUpdated = (data) => {
    if (socket && connected) {
      socket.emit("card-updated", data);
    }
  };

  const emitListUpdated = (data) => {
    if (socket && connected) {
      socket.emit("list-updated", data);
    }
  };

  const emitCursorMove = (data) => {
    if (socket && connected) {
      socket.emit("cursor-move", data);
    }
  };

  const value = {
    socket,
    connected,
    onlineUsers,
    joinWorkspace,
    leaveWorkspace,
    emitCardMoved,
    emitCardUpdated,
    emitListUpdated,
    emitCursorMove,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
