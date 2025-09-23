const express = require("express");
const { body, validationResult } = require("express-validator");
const Comment = require("../models/Comment");
const Card = require("../models/Card");
const Workspace = require("../models/Workspace");
const Activity = require("../models/Activity");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all comments for a card
router.get("/card/:cardId", auth, async (req, res) => {
  try {
    const { cardId } = req.params;

    const card = await Card.findById(cardId).populate("workspaceId");
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }

    // Check if user has access to the workspace
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
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new comment
router.post(
  "/",
  [
    auth,
    body("cardId").isMongoId().withMessage("Valid card ID is required"),
    body("content").trim().isLength({ min: 1 }).withMessage("Comment content is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { cardId, content } = req.body;

      const card = await Card.findById(cardId).populate("workspaceId");
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      // Check if user has access to the workspace
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
        content: content.trim(),
      });

      await comment.populate("userId", "name email");

      // Create activity log
      await Activity.create({
        workspaceId: card.workspaceId,
        userId: req.user.id,
        action: `commented on card "${card.title}"`,
        timestamp: new Date(),
      });

      // Emit real-time update
      const io = req.app.get("io");
      if (io) {
        io.to(`workspace-${card.workspaceId}`).emit("comment-created", {
          workspaceId: card.workspaceId,
          cardId: cardId,
          comment: comment,
          userId: req.user.id,
          userName: req.user.name,
        });
      }

      res.status(201).json({
        message: "Comment created successfully",
        comment,
      });
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(500).json({ message: "Server error during comment creation" });
    }
  }
);

// Update a comment
router.put(
  "/:commentId",
  [
    auth,
    body("content").trim().isLength({ min: 1 }).withMessage("Comment content is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { commentId } = req.params;
      const { content } = req.body;

      const comment = await Comment.findById(commentId).populate("cardId");
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Check if user is the author of the comment
      if (comment.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "You can only edit your own comments" });
      }

      comment.content = content.trim();
      await comment.save();

      await comment.populate("userId", "name email");

      // Emit real-time update
      const io = req.app.get("io");
      if (io) {
        io.to(`workspace-${comment.workspaceId}`).emit("comment-updated", {
          workspaceId: comment.workspaceId,
          cardId: comment.cardId._id,
          comment: comment,
          userId: req.user.id,
          userName: req.user.name,
        });
      }

      res.json({
        message: "Comment updated successfully",
        comment,
      });
    } catch (error) {
      console.error("Update comment error:", error);
      res.status(500).json({ message: "Server error during comment update" });
    }
  }
);

// Delete a comment
router.delete("/:commentId", auth, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId).populate("cardId");
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author of the comment
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await Comment.findByIdAndDelete(commentId);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(`workspace-${comment.workspaceId}`).emit("comment-deleted", {
        workspaceId: comment.workspaceId,
        cardId: comment.cardId._id,
        commentId: commentId,
        userId: req.user.id,
        userName: req.user.name,
      });
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ message: "Server error during comment deletion" });
  }
});

module.exports = router;
