const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
  },
  position: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("List", listSchema);
