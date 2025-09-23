const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "List",
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
  },
  position: {
    type: Number,
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  labels: [
    {
      type: String,
    },
  ],
  dueDate: {
    type: Date,
  },
});

module.exports = mongoose.model("Card", cardSchema);
