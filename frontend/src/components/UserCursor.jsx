import React from "react";

const UserCursor = ({ user, x, y, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-100 ease-out"
      style={{
        left: x,
        top: y,
        transform: "translate(-2px, -2px)",
      }}
    >
      {/* Cursor pointer */}
      <div className="relative">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          className="drop-shadow-lg"
        >
          <path
            d="M2 2L8 16L11 10L16 8L2 2Z"
            fill="currentColor"
            stroke="white"
            strokeWidth="1"
          />
        </svg>

        {/* User label */}
        <div
          className="absolute top-4 left-2 px-3 py-1 text-sm font-semibold text-white rounded-full shadow-lg whitespace-nowrap border-2 border-white"
          style={{
            backgroundColor: `hsl(${
              (user.userId?.charCodeAt(0) * 137.5) % 360 || 0
            }, 70%, 50%)`,
          }}
        >
          {user.userName || user.userId || "Unknown User"}
        </div>
      </div>
    </div>
  );
};

export default UserCursor;
