const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
  },
  position: {
    type: Number,
    required: true,
  },
  cards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
    },
  ],
  cardOrder: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
    },
  ],
});

listSchema.index({ workspaceId: 1 });
listSchema.index({ workspaceId: 1, position: 1 });
listSchema.index({ position: 1 });

module.exports = mongoose.model("List", listSchema);
