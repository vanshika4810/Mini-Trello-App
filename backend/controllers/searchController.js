const Card = require("../models/Card");
const Workspace = require("../models/Workspace");

// Search cards in a workspace
const searchCards = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { q } = req.query;

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user.id,
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    let searchQuery = { workspaceId };
    if (q && q.trim()) {
      searchQuery.$or = [
        { title: { $regex: q.trim(), $options: "i" } },
        { description: { $regex: q.trim(), $options: "i" } },
      ];
    }

    const cards = await Card.find(searchQuery)
      .populate("assignedTo", "name email")
      .populate("listId", "title")
      .sort({ createdAt: -1 });

    res.json({ cards });
  } catch (error) {
    console.error("Search cards error:", error);
    res.status(500).json({ message: "Server error during search" });
  }
};

module.exports = {
  searchCards,
};
