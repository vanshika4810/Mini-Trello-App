import React, { useState } from "react";
import { Plus, X, Calendar, User, Tag } from "lucide-react";

const CreateCard = ({ listId, onCardCreated, onCancel }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    labels: [],
    dueDate: "",
  });
  const [newLabel, setNewLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          assignedTo: formData.assignedTo.trim() || undefined,
          listId,
          workspaceId: window.location.pathname.split("/")[2],
          labels: formData.labels.filter((label) => label.trim() !== ""),
          dueDate: formData.dueDate || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onCardCreated(data.card);
        setFormData({
          title: "",
          description: "",
          assignedTo: "",
          labels: [],
          dueDate: "",
        });
        setIsCreating(false);
      } else {
        const error = await response.json();
        console.error("Error creating card:", error);
        alert("Failed to create card. Please try again.");
      }
    } catch (error) {
      console.error("Error creating card:", error);
      alert("Failed to create card. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData({
        ...formData,
        labels: [...formData.labels, newLabel.trim()],
      });
      setNewLabel("");
    }
  };

  const removeLabel = (labelToRemove) => {
    setFormData({
      ...formData,
      labels: formData.labels.filter((label) => label !== labelToRemove),
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (e.target.name === "newLabel") {
        addLabel();
      } else {
        handleSubmit(e);
      }
    }
  };

  if (!isCreating) {
    return (
      <button
        onClick={() => setIsCreating(true)}
        className="w-full p-3 text-left text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
      >
        <Plus className="h-4 w-4 inline mr-2" />
        Add a card
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          name="title"
          placeholder="Enter a title for this card..."
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          onKeyPress={handleKeyPress}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
          required
        />
      </div>

      <div>
        <textarea
          name="description"
          placeholder="Add a description..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          onKeyPress={handleKeyPress}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows="2"
        />
      </div>

      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Tag className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            name="newLabel"
            placeholder="Add a label..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 p-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addLabel}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Add
          </button>
        </div>
        {formData.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {formData.labels.map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {label}
                <button
                  type="button"
                  onClick={() => removeLabel(label)}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <input
            type="datetime-local"
            name="dueDate"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            className="flex-1 p-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            name="assignedTo"
            placeholder="Assign to (email or name)..."
            value={formData.assignedTo}
            onChange={(e) =>
              setFormData({ ...formData, assignedTo: e.target.value })
            }
            onKeyPress={handleKeyPress}
            className="flex-1 p-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          type="submit"
          disabled={isLoading || !formData.title.trim()}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Creating..." : "Add Card"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsCreating(false);
            setFormData({
              title: "",
              description: "",
              assignedTo: "",
              labels: [],
              dueDate: "",
            });
            onCancel?.();
          }}
          className="px-3 py-1 text-gray-600 text-sm rounded hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CreateCard;
