import React, { useState } from "react";
import { Calendar, User, Tag, Edit2, Trash2, Move } from "lucide-react";
import EditCard from "./EditCard";

const Card = ({ card, onEdit, onDelete, onMove, isDragging = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const formatDate = (date) => {
    if (!date) return null;
    const cardDate = new Date(date);
    const today = new Date();
    const diffTime = cardDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
  };

  const getDateColor = (date) => {
    if (!date) return "text-gray-500";
    const cardDate = new Date(date);
    const today = new Date();
    const diffTime = cardDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "text-red-500";
    if (diffDays === 0) return "text-orange-500";
    if (diffDays <= 3) return "text-yellow-500";
    return "text-gray-500";
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = (updatedCard) => {
    onEdit(updatedCard);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return <EditCard card={card} onSave={handleSave} onCancel={handleCancel} />;
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer ${
        isDragging ? "opacity-50 transform rotate-2" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleEdit}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm leading-tight">
          {card.title}
        </h4>
        {isHovered && (
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit card"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMove(card);
              }}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Move card"
            >
              <Move className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card);
              }}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete card"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {card.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {card.description}
        </p>
      )}

      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {card.labels.map((label, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              <Tag className="h-2 w-2 mr-1" />
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {card.assignedTo && (
            <div className="flex items-center">
              <User className="h-3 w-3 mr-1" />
              <span className="truncate max-w-20">{card.assignedTo.name}</span>
            </div>
          )}

          {card.dueDate && (
            <div className={`flex items-center ${getDateColor(card.dueDate)}`}>
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(card.dueDate)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
