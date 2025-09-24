const List = require("../models/List");
const Workspace = require("../models/Workspace");
const Card = require("../models/Card");

// Create a new list
const createList = async (req, res) => {
  try {
    const { title, workspaceId } = req.body;

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      "members.user": req.user.id,
    });

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Get the maximum position for lists in this workspace
    const maxPosition = await List.findOne({ workspaceId }).sort({
      position: -1,
    });
    const position = maxPosition ? maxPosition.position + 1 : 1;

    const list = await List.create({
      title,
      workspaceId,
      position,
    });

    // Add list to workspace
    await Workspace.findByIdAndUpdate(workspaceId, {
      $push: { lists: list._id },
    });

    await list.populate("cards");

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
};

// Update a list
const updateList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title } = req.body;

    const list = await List.findById(listId).populate("workspaceId");
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    // Check if user has access to the workspace
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
    ).populate("cards");

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
    }

    res.json({
      message: "List updated successfully",
      list: updatedList,
    });
  } catch (error) {
    console.error("Update list error:", error);
    res.status(500).json({ message: "Server error during list update" });
  }
};

// Delete a list
const deleteList = async (req, res) => {
  try {
    const { listId } = req.params;

    const list = await List.findById(listId).populate("workspaceId");
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: list.workspaceId,
      "members.user": req.user.id,
    });

    if (!workspace) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete all cards in the list
    await Card.deleteMany({ listId: listId });

    // Remove list from workspace
    await Workspace.findByIdAndUpdate(list.workspaceId, {
      $pull: { lists: listId },
    });

    // Delete the list
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
};

module.exports = {
  createList,
  updateList,
  deleteList,
};
