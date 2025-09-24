const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  action: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

activitySchema.index({ workspaceId: 1 });
activitySchema.index({ userId: 1 });
activitySchema.index({ workspaceId: 1, timestamp: -1 });
activitySchema.index({ timestamp: -1 });

module.exports = mongoose.model("Activity", activitySchema);
