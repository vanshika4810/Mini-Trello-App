const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
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
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
  },
  members: [
    {
      user: mongoose.Schema.Types.ObjectId,
      role: String,
    },
  ],
});

module.exports = mongoose.model("Board", boardSchema);
