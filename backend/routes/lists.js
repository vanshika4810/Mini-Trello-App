const express = require("express");
const { body, validationResult } = require("express-validator");
const List = require("../models/List");
const Card = require("../models/Card");
const Workspace = require("../models/Workspace");
const auth = require("../middleware/auth");

const router = express.Router();

// Create a new list
router.post(
  "/",
  [
    auth,
    body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
    body("workspaceId")
      .isMongoId()
      .withMessage("Valid workspace ID is required"),
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

      const { title, workspaceId } = req.body;

      const workspace = await Workspace.findOne({
        _id: workspaceId,
        "members.user": req.user.id,
      });

      if (!workspace) {
        return res
          .status(404)
          .json({ message: "Workspace not found or access denied" });
      }

      const maxPosition = await List.findOne({ workspaceId }).sort({
        position: -1,
      });
      const position = maxPosition ? maxPosition.position + 1 : 1;

      const list = await List.create({
        title,
        workspaceId,
        position,
        cards: [],
        cardOrder: [],
      });

      await Workspace.findByIdAndUpdate(workspaceId, {
        $push: { lists: list._id },
      });

      // Emit real-time update
      const io = req.app.get("io");
      if (io) {
        io.to(`workspace-${workspaceId}`).emit("list-created", {
          workspaceId: workspaceId,
          list: list,
          userId: req.user.id,
          userName: req.user.name,
        });
      }

      res.status(201).json({
        message: "List created successfully",
        list,
      });
    } catch (error) {
      console.error("Create list error:", error);
      res.status(500).json({ message: "Server error during list creation" });
    }
  }
);

// Update a list
router.put(
  "/:listId",
  [auth, body("title").optional().trim().isLength({ min: 1 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { listId } = req.params;
      const { title } = req.body;

      const list = await List.findById(listId).populate("workspaceId");
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }

      const workspace = await Workspace.findOne({
        _id: list.workspaceId,
        "members.user": req.user.id,
      });

      if (!workspace) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedList = await List.findByIdAndUpdate(
        listId,
        { title },
        { new: true }
      );

      // Emit real-time update
      const io = req.app.get("io");
      if (io) {
        const emitData = {
          workspaceId: list.workspaceId,
          listId: listId,
          list: updatedList,
          userId: req.user.id,
          userName: req.user.name,
        };
        io.to(`workspace-${list.workspaceId}`).emit("list-updated", emitData);
      } else {
      }

      res.json({
        message: "List updated successfully",
        list: updatedList,
      });
    } catch (error) {
      console.error("Update list error:", error);
      res.status(500).json({ message: "Server error during list update" });
    }
  }
);

// Delete a list
router.delete("/:listId", auth, async (req, res) => {
  try {
    const { listId } = req.params;

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    const workspace = await Workspace.findOne({
      _id: list.workspaceId,
      "members.user": req.user.id,
    });

    if (!workspace) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Card.deleteMany({ listId: listId });

    await Workspace.findByIdAndUpdate(list.workspaceId, {
      $pull: { lists: listId },
    });

    await List.findByIdAndDelete(listId);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(`workspace-${list.workspaceId}`).emit("list-deleted", {
        workspaceId: list.workspaceId,
        listId: listId,
        userId: req.user.id,
        userName: req.user.name,
      });
    }

    res.json({
      message: "List deleted successfully",
    });
  } catch (error) {
    console.error("Delete list error:", error);
    res.status(500).json({ message: "Server error during list deletion" });
  }
});

// Edit a list title
router.put(
  "/:listId",
  [
    auth,
    body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
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

      const { listId } = req.params;
      const { title } = req.body;

      const list = await List.findById(listId).populate("workspaceId");
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }

      const workspace = await Workspace.findOne({
        _id: list.workspaceId,
        "members.user": req.user.id,
      });

      if (!workspace) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedList = await List.findByIdAndUpdate(
        listId,
        { title: title.trim() },
        { new: true }
      );

      res.json({
        message: "List updated successfully",
        list: updatedList,
      });
    } catch (error) {
      console.error("Update list error:", error);
      res.status(500).json({ message: "Server error during list update" });
    }
  }
);

module.exports = router;
