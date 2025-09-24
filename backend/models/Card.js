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

cardSchema.index({ workspaceId: 1 });
cardSchema.index({ listId: 1 });
cardSchema.index({ assignedTo: 1 });
cardSchema.index({ workspaceId: 1, listId: 1 });
cardSchema.index({ workspaceId: 1, assignedTo: 1 });
cardSchema.index({ workspaceId: 1, labels: 1 });
cardSchema.index({ title: "text", description: "text" });
cardSchema.index({ position: 1 });
cardSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Card", cardSchema);
