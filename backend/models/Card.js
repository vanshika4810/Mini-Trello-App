const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  listId: {
    type: mongoose.Schema.Type.ObjectId,
    ref: "List",
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
  },
  position: {
    type: Number,
    required: true,
  },
  assignees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  labels: [
    {
      type: String,
    },
  ],
  dueDate: {
    type: Date,
  },
});

module.exports = mongoose.Schema("Card", cardSchema);
