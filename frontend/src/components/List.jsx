import React, { useState } from "react";
import { Move, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Card from "./Card";
import CreateCard from "./CreateCard";

const List = ({
  list,
  onCardCreated,
  onCardEdit,
  onCardDelete,
  onCardMove,
  onListDelete,
  onListEdit,
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);

  const { setNodeRef, isOver } = useDroppable({
    id: list._id,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: list._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCardCreated = (newCard) => {
    onCardCreated(newCard);
    setIsAddingCard(false);
  };

  const handleCardEdit = (updatedCard) => {
    onCardEdit(updatedCard);
  };

  const handleCardDelete = (card) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      onCardDelete(card);
    }
  };

  const handleCardMove = (card) => {
    onCardMove(card);
  };

  const handleListDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the list "${list.title}"? This will also delete all cards in this list. This action cannot be undone.`
      )
    ) {
      onListDelete(list._id);
    }
  };

  const handleEditTitle = () => {
    setIsEditingTitle(true);
    setEditTitle(list.title);
  };

  const handleSaveTitle = async () => {
    if (editTitle.trim() && editTitle.trim() !== list.title) {
      await onListEdit(list._id, editTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(list.title);
    setIsEditingTitle(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const sortedCards = list.cards
    ? [...list.cards].sort((a, b) => {
        if (list.cardOrder && list.cardOrder.length > 0) {
          const aIndex = list.cardOrder.findIndex(
            (id) => id.toString() === a._id.toString()
          );
          const bIndex = list.cardOrder.findIndex(
            (id) => id.toString() === b._id.toString()
          );
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
        }
        return (a.position || 0) - (b.position || 0);
      })
    : [];

  return (
    <div
      ref={setSortableRef}
      style={style}
      className={`flex-shrink-0 w-80 ${isSortableDragging ? "opacity-50" : ""}`}
      {...attributes}
    >
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditingTitle ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 px-2 py-1 text-sm font-medium text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-1 text-green-600 hover:text-green-700 transition-colors"
                    title="Save"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h3
                    className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={handleEditTitle}
                    title="Click to edit"
                  >
                    {list.title}
                  </h3>
                  <button
                    onClick={handleEditTitle}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit title"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500">
                {sortedCards.length} card{sortedCards.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <button
                className="p-1 text-gray-400 hover:text-green-600 transition-colors cursor-pointer"
                title="Drag to move list"
                {...listeners}
              >
                <Move className="h-4 w-4" />
              </button>
              <button
                onClick={handleListDelete}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete list"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          className={`p-4 min-h-96 transition-colors duration-200 ${
            isOver ? "bg-blue-50 border-blue-200" : ""
          }`}
          ref={setNodeRef}
        >
          <SortableContext
            items={sortedCards.map((card) => card._id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedCards.length > 0 ? (
              <div className="space-y-3">
                {sortedCards.map((card) => (
                  <Card
                    key={card._id}
                    card={card}
                    onEdit={handleCardEdit}
                    onDelete={handleCardDelete}
                    onMove={handleCardMove}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No cards in this list</p>
              </div>
            )}
          </SortableContext>

          <div className="mt-4">
            {isAddingCard ? (
              <CreateCard
                listId={list._id}
                onCardCreated={handleCardCreated}
                onCancel={() => setIsAddingCard(false)}
              />
            ) : (
              <button
                onClick={() => setIsAddingCard(true)}
                className="w-full p-3 text-left text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add a card
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default List;
