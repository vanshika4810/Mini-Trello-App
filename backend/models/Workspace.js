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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
      role: {
        type: String,
        enum: ["admin", "member"],
        default: "member",
      },
      invitedAt: {
        type: Date,
        default: Date.now,
      },
      joinedAt: {
        type: Date,
      },
    },
  ],
  lists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
    },
  ],
});

workspaceSchema.index({ "members.user": 1 });
workspaceSchema.index({ visibility: 1 });
workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ "members.user": 1, visibility: 1 });
workspaceSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Workspace", workspaceSchema);
