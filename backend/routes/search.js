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

    // Build search query
    let searchQuery = { workspaceId };

    // Text search
    if (q && q.trim()) {
      searchQuery.$or = [
        { title: { $regex: q.trim(), $options: "i" } },
        { description: { $regex: q.trim(), $options: "i" } },
      ];
    }

    // Label filter
    if (label && label.trim()) {
      searchQuery.labels = { $in: [label.trim()] };
    }

    // Assignee filter
    if (assignee && assignee.trim()) {
      // First, find users that match the assignee search
      const User = require("../models/User");
      const users = await User.find({
        $or: [
          { name: { $regex: assignee.trim(), $options: "i" } },
          { email: { $regex: assignee.trim(), $options: "i" } },
        ],
      });
      
      if (users.length > 0) {
        searchQuery.assignedTo = { $in: users.map(user => user._id) };
      } else {
        // No users found, return empty results
        return res.json({ cards: [] });
      }
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
    res.json({ labels: labels.filter(label => label && label.trim()) });
  } catch (error) {
    console.error("Get labels error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all assignees in a workspace
router.get("/workspace/:workspaceId/assignees", auth, async (req, res) => {
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

    const assigneeIds = await Card.distinct("assignedTo", { 
      workspaceId,
      assignedTo: { $ne: null }
    });

    const User = require("../models/User");
    const assignees = await User.find({ _id: { $in: assigneeIds } })
      .select("name email")
      .sort({ name: 1 });

    res.json({ assignees });
  } catch (error) {
    console.error("Get assignees error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
