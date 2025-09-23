import React, { useState } from "react";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import Card from "./Card";
import CreateCard from "./CreateCard";

const List = ({
  list,
  onCardCreated,
  onCardEdit,
  onCardDelete,
  onCardMove,
  onListDelete,
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);

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
    <div className="flex-shrink-0 w-80">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{list.title}</h3>
              <p className="text-sm text-gray-500">
                {sortedCards.length} card{sortedCards.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
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

        <div className="p-4 min-h-96">
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
