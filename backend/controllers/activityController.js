const Activity = require("../models/Activity");
const Workspace = require("../models/Workspace");

// Get activities for a workspace
const getActivities = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user.id,
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const activities = await Activity.find({ workspaceId })
      .populate("userId", "name email")
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    res.json({ activities });
  } catch (error) {
    console.error("Get activities error:", error);
    res.status(500).json({ message: "Server error during activities fetch" });
  }
};

module.exports = {
  getActivities,
};
