const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  visibility: {
    type: String,
    enum: ["private", "public"],
    default: "private",
    required: true,
  },
  dueDate: {
    type: Date,
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      role: String,
    },
  ],
  lists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
    },
  ],
});

module.exports = mongoose.model("Workspace", workspaceSchema);
