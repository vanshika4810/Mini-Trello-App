const Comment = require("../models/Comment");
const Card = require("../models/Card");
const Workspace = require("../models/Workspace");

// Get comments for a card
const getComments = async (req, res) => {
  try {
    const { cardId } = req.params;

    // Check if user has access to the card's workspace
    const card = await Card.findById(cardId).populate("workspaceId");
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const workspace = await Workspace.findOne({
      _id: card.workspaceId,
      "members.user": req.user.id,
    });

    if (!workspace) {
      return res.status(403).json({ message: "Access denied" });
    }

    const comments = await Comment.find({ cardId })
      .populate("userId", "name email")
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Server error during comments fetch" });
  }
};

// Create a new comment
const createComment = async (req, res) => {
  try {
    const { cardId, content } = req.body;

    // Check if user has access to the card's workspace
    const card = await Card.findById(cardId).populate("workspaceId");
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    const workspace = await Workspace.findOne({
      _id: card.workspaceId,
      "members.user": req.user.id,
    });

    if (!workspace) {
      return res.status(403).json({ message: "Access denied" });
    }

    const comment = await Comment.create({
      cardId,
      workspaceId: card.workspaceId,
      userId: req.user.id,
      content,
    });

    await comment.populate("userId", "name email");

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Server error during comment creation" });
  }
};

// Update a comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author of the comment
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    ).populate("userId", "name email");

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ message: "Server error during comment update" });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author of the comment or has admin access
    const workspace = await Workspace.findOne({
      _id: comment.workspaceId,
      "members.user": req.user.id,
    });

    const isAuthor = comment.userId.toString() === req.user.id;
    const isAdmin = workspace?.members.find(
      (member) =>
        member.user.toString() === req.user.id && member.role === "admin"
    );

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Comment.findByIdAndDelete(commentId);

    res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error during comment deletion" });
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};
