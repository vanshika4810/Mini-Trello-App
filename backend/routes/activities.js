const express = require("express");
const Activity = require("../models/Activity");
const Workspace = require("../models/Workspace");
const auth = require("../middleware/auth");

const router = express.Router();

// Get activities for a workspace
router.get("/workspace/:workspaceId", auth, async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user.id,
    });

    if (!workspace) {
      return res.status(403).json({ message: "Access denied" });
    }

    const activities = await Activity.find({ workspaceId })
      .populate("userId", "name email")
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({ activities });
  } catch (error) {
    console.error("Get activities error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
