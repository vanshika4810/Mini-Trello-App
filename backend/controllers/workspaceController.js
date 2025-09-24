const Workspace = require("../models/Workspace");
const User = require("../models/User");
const List = require("../models/List");

// Create a new workspace
const createWorkspace = async (req, res) => {
  try {
    const { title, visibility, dueDate } = req.body;

    const workspace = await Workspace.create({
      title,
      visibility,
      dueDate: dueDate ? new Date(dueDate) : null,
      owner: req.user.id,
      members: [
        {
          user: req.user.id,
          role: "admin",
        },
      ],
    });

    await workspace.populate("owner", "name email");
    await workspace.populate("members.user", "name email");

    res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    console.error("Create workspace error:", error);
    res.status(500).json({ message: "Server error during workspace creation" });
  }
};

// Get all workspaces for a user
const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user.id },
        { "members.user": req.user.id },
        { visibility: "public" },
      ],
    })
      .populate("owner", "name email")
      .populate("members.user", "name email")
      .sort({ createdAt: -1 });

    res.json({ workspaces });
  } catch (error) {
    console.error("Get workspaces error:", error);
    res.status(500).json({ message: "Server error during workspaces fetch" });
  }
};

// Get a specific workspace
const getWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId)
      .populate("owner", "name email")
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

    res.json({
      message: "Workspace fetched successfully",
      workspace,
    });
  } catch (error) {
    console.error("Get workspace error:", error);
    res.status(500).json({ message: "Server error during fetching workspace" });
  }
};

// Toggle workspace visibility
const toggleVisibility = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { visibility } = req.body;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      owner: req.user.id,
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    workspace.visibility = visibility;
    await workspace.save();

    res.json({
      message: "Workspace visibility updated successfully",
      workspace,
    });
  } catch (error) {
    console.error("Toggle visibility error:", error);
    res.status(500).json({ message: "Server error during visibility update" });
  }
};

// Add member to workspace
const addMember = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { userEmail, role } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner = workspace.owner.toString() === req.user.id;
    const isAdmin = workspace.members.find(
      (member) =>
        member.user.toString() === req.user.id && member.role === "admin"
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingMember = workspace.members.find(
      (member) => member.user.toString() === user._id.toString()
    );

    if (existingMember) {
      return res.status(400).json({ message: "User is already a member" });
    }

    workspace.members.push({
      user: user._id,
      role: role || "member",
    });

    await workspace.save();
    await workspace.populate("members.user", "name email");

    res.json({
      message: "Member added successfully",
      workspace,
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({ message: "Server error during member addition" });
  }
};

// Remove member from workspace
const removeMember = async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner = workspace.owner.toString() === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    workspace.members = workspace.members.filter(
      (member) => member.user.toString() !== userId
    );

    await workspace.save();

    res.json({
      message: "Member removed successfully",
      workspace,
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ message: "Server error during member removal" });
  }
};

// Delete workspace
const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      owner: req.user.id,
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    await Workspace.findByIdAndDelete(workspaceId);

    res.json({ message: "Workspace deleted successfully" });
  } catch (error) {
    console.error("Delete workspace error:", error);
    res.status(500).json({ message: "Server error during workspace deletion" });
  }
};

// Reorder lists in workspace
const reorderLists = async (req, res) => {
  try {
    const { workspaceId, listOrder } = req.body;

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user.id,
    });

    if (!workspace) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update positions for all lists
    for (let i = 0; i < listOrder.length; i++) {
      await List.findByIdAndUpdate(listOrder[i], { position: i + 1 });
    }

    // Update workspace list order
    await Workspace.findByIdAndUpdate(workspaceId, {
      lists: listOrder,
    });

    res.json({
      message: "Lists reordered successfully",
      listOrder,
    });
  } catch (error) {
    console.error("Reorder lists error:", error);
    res.status(500).json({ message: "Server error during list reorder" });
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  toggleVisibility,
  addMember,
  removeMember,
  deleteWorkspace,
  reorderLists,
};
