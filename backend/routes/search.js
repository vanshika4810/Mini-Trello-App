const express = require("express");
const Card = require("../models/Card");
const List = require("../models/List");
const Workspace = require("../models/Workspace");
const auth = require("../middleware/auth");

const router = express.Router();

// Search cards within a workspace
router.get("/workspace/:workspaceId", auth, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { q, label, assignee } = req.query;

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user.id,
    });

    if (!workspace) {
      return res.status(403).json({ message: "Access denied" });
    }

    let searchQuery = { workspaceId };

    if (q && q.trim()) {
      searchQuery.$or = [
        { title: { $regex: q.trim(), $options: "i" } },
        { description: { $regex: q.trim(), $options: "i" } },
      ];
    }

    if (label && label.trim()) {
      searchQuery.labels = { $in: [label.trim()] };
    }

    const cards = await Card.find(searchQuery)
      .populate("assignedTo", "name email")
      .populate("listId", "title")
      .sort({ createdAt: -1 });

    res.json({ cards });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error during search" });
  }
});

// Get all unique labels in a workspace
router.get("/workspace/:workspaceId/labels", auth, async (req, res) => {
  try {
    const { workspaceId } = req.params;

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user.id,
    });

    if (!workspace) {
      return res.status(403).json({ message: "Access denied" });
    }

    const labels = await Card.distinct("labels", { workspaceId });
    res.json({ labels: labels.filter((label) => label && label.trim()) });
  } catch (error) {
    console.error("Get labels error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
