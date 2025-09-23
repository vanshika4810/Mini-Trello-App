const express = require("express");
const { body, validationResult } = require("express-validator");
const Workspace = require("../models/Workspace");
const auth = require("../middleware/auth");
const router = express.Router();

// Create a new workspace
router.post(
  "/",
  [
    auth,
    body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
    body("visibility")
      .optional()
      .isIn(["private", "public"])
      .withMessage("Visibility must be private or public"),
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

      const { title, visibility = "private", dueDate } = req.body;
      const workspaceData = {
        title,
        visibility,
        dueDate: dueDate ? new Date(dueDate) : null,
        members: [
          {
            user: req.user.id,
            role: "owner",
          },
        ],
      };

      const workspace = await Workspace.create(workspaceData);

      // Populate the workspace with user details
      await workspace.populate("members.user", "name email");

      res.status(201).json({
        message: "Workspace created successfully",
        workspace,
      });
    } catch (error) {
      console.error("Create workspace error:", error);
      res
        .status(500)
        .json({ message: "Server error during workspace creation" });
    }
  }
);
// Get and show all workspaces on dashboard
router.get("/", auth, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user.id,
    })
      .populate("members.user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      message: "Workspaces fetched successfully",
      workspaces,
    });
  } catch (error) {
    console.error("Get workspaces error:", error);
    res
      .status(500)
      .json({ message: "Server error during fetching workspaces" });
  }
});

// Get the workspace
router.get("/:workspaceId", auth, async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.workspaceId,
      "members.user": req.user.id,
    })
      .populate("members.user", "name email")
      .populate({
        path: "lists",
        populate: {
          path: "cards",
          populate: {
            path: "assignedTo",
            select: "name email",
          },
        },
      });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    console.log("Workspace fetched successfully");
    res.json({
      message: "Workspace fetched successfully",
      workspace,
    });
  } catch (error) {
    console.error("Get workspace error:", error);
    res.status(500).json({ message: "Server error during fetching workspace" });
  }
});

// Toggle workspace visibility
router.put(
  "/:workspaceId/visibility",
  [
    auth,
    body("visibility")
      .isIn(["private", "public"])
      .withMessage("Visibility must be private or public"),
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

      const { workspaceId } = req.params;
      const { visibility } = req.body;

      // Check if user has access to the workspace
      const workspace = await Workspace.findOne({
        _id: workspaceId,
        "members.user": req.user.id,
      });

      if (!workspace) {
        return res
          .status(404)
          .json({ message: "Workspace not found or access denied" });
      }

      // Update the workspace visibility
      const updatedWorkspace = await Workspace.findByIdAndUpdate(
        workspaceId,
        { visibility },
        { new: true }
      ).populate("members.user", "name email");

      res.json({
        message: "Workspace visibility updated successfully",
        workspace: updatedWorkspace,
      });
    } catch (error) {
      console.error("Update workspace visibility error:", error);
      res
        .status(500)
        .json({ message: "Server error during visibility update" });
    }
  }
);

// Delete a workspace
router.delete("/:workspaceId", auth, async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user.id,
    });

    if (!workspace) {
      return res
        .status(404)
        .json({ message: "Workspace not found or access denied" });
    }

    await Workspace.findByIdAndDelete(workspaceId);

    res.json({
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    console.error("Delete workspace error:", error);
    res.status(500).json({ message: "Server error during workspace deletion" });
  }
});

// Reorder lists within a workspace
router.put(
  "/:workspaceId/reorder-lists",
  [
    auth,
    body("listOrder").isArray().withMessage("List order array is required"),
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

      const { workspaceId } = req.params;
      const { listOrder } = req.body;

      const workspace = await Workspace.findOne({
        _id: workspaceId,
        "members.user": req.user.id,
      });

      if (!workspace) {
        return res.status(403).json({ message: "Access denied" });
      }

      const workspaceListIds = workspace.lists.map((list) => list.toString());

      for (const listId of listOrder) {
        const listIdStr = listId.toString();
        if (!workspaceListIds.includes(listIdStr)) {
          return res.status(400).json({
            message: `List ${listId} does not belong to this workspace`,
          });
        }
      }

      await Workspace.findByIdAndUpdate(workspaceId, {
        lists: listOrder,
      });

      res.json({
        message: "Lists reordered successfully",
        workspaceId: workspaceId,
        listOrder: listOrder,
      });
    } catch (error) {
      console.error("Reorder lists error:", error);
      res.status(500).json({ message: "Server error during list reorder" });
    }
  }
);

module.exports = router;
