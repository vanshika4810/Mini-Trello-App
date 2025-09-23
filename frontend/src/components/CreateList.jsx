import React, { useState } from "react";
import { Plus, X } from "lucide-react";

const CreateList = ({
  workspaceId,
  onListCreated,
  onCancel,
  showForm = false,
}) => {
  const [isCreating, setIsCreating] = useState(showForm);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          workspaceId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onListCreated(data.list);
        setTitle("");
        setIsCreating(false);
      } else {
        const error = await response.json();
        console.error("Error creating list:", error);
        alert("Failed to create list. Please try again.");
      }
    } catch (error) {
      console.error("Error creating list:", error);
      alert("Failed to create list. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isCreating) {
    return (
      <button
        onClick={() => setIsCreating(true)}
        className="flex-shrink-0 w-80 p-4 text-left text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
      >
        <Plus className="h-4 w-4 inline mr-2" />
        Add a list
      </button>
    );
  }

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Enter list title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              required
            />
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                disabled={isLoading || !title.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Creating..." : "Add List"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setTitle("");
                  onCancel?.();
                }}
                className="px-3 py-1 text-gray-600 text-sm rounded hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateList;
