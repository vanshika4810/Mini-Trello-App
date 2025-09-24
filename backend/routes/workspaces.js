const express = require("express");
const { body, validationResult } = require("express-validator");
const Workspace = require("../models/Workspace");
const User = require("../models/User");
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
        owner: req.user.id,
        dueDate: dueDate ? new Date(dueDate) : null,
        members: [
          {
            user: req.user.id,
            role: "admin",
            joinedAt: new Date(),
          },
        ],
      };

      const workspace = await Workspace.create(workspaceData);

      // Populate the workspace with user details
      await workspace.populate("members.user", "name email");
      await workspace.populate("owner", "name email");

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
    // Get workspaces where user is a member OR public workspaces
    const workspaces = await Workspace.find({
      $or: [
        { "members.user": req.user.id }, // User is a member
        { visibility: "public" }, // Public workspaces
      ],
    })
      .populate("members.user", "name email")
      .populate("owner", "name email")
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
      $or: [
        { "members.user": req.user.id }, // User is a member
        { visibility: "public" }, // Public workspace
      ],
    })
      .populate("members.user", "name email")
      .populate("owner", "name email")
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

// Add member to workspace
router.post(
  "/:workspaceId/members",
  [
    auth,
    body("email").isEmail().withMessage("Valid email is required"),
    body("role")
      .optional()
      .isIn(["admin", "member"])
      .withMessage("Role must be admin or member"),
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
      const { email, role = "member" } = req.body;

      // Check if user has admin access to the workspace
      const workspace = await Workspace.findById(workspaceId);

      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }

      // Check if workspace has an owner
      if (!workspace.owner) {
        console.error("Workspace has no owner:", workspaceId);
        return res
          .status(500)
          .json({ message: "Workspace configuration error" });
      }

      // Check if user is owner or admin
      const isOwner = workspace.owner.toString() === req.user.id;
      const isAdmin = workspace.members.some(
        (member) =>
          member.user.toString() === req.user.id && member.role === "admin"
      );

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Find user by email
      const userToInvite = await User.findOne({ email });
      if (!userToInvite) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user is already a member
      const isAlreadyMember = workspace.members.some(
        (member) => member.user.toString() === userToInvite._id.toString()
      );

      if (isAlreadyMember) {
        return res.status(400).json({ message: "User is already a member" });
      }

      // Add user to workspace members
      workspace.members.push({
        user: userToInvite._id,
        role,
        joinedAt: new Date(),
      });

      await workspace.save();

      // Populate the updated workspace
      await workspace.populate("members.user", "name email");
      await workspace.populate("owner", "name email");

      res.json({
        message: "Member added successfully",
        workspace,
      });
    } catch (error) {
      console.error("Add member error:", error);
      res.status(500).json({ message: "Server error during member addition" });
    }
  }
);

// Remove member from workspace
router.delete("/:workspaceId/members/:userId", auth, async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;

    // Check if user has admin access to the workspace
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if workspace has an owner, if not, set the first admin as owner
    if (!workspace.owner) {
      // Find the first admin member
      const adminMember = workspace.members.find(
        (member) => member.role === "admin"
      );

      if (adminMember) {
        // Set the admin as owner
        workspace.owner = adminMember.user;
        await workspace.save();
      } else if (workspace.members.length > 0) {
        // If no admin, set the first member as owner and admin
        const firstMember = workspace.members[0];
        workspace.owner = firstMember.user;
        firstMember.role = "admin";
        await workspace.save();
      } else {
        console.error("Workspace has no members and no owner:", workspaceId);
        return res
          .status(500)
          .json({ message: "Workspace configuration error" });
      }
    }

    // Check if user is owner or admin
    const isOwner = workspace.owner.toString() === req.user.id;
    const isAdmin = workspace.members.some(
      (member) =>
        member.user.toString() === req.user.id && member.role === "admin"
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Cannot remove the owner
    if (workspace.owner.toString() === userId) {
      return res.status(400).json({ message: "Cannot remove workspace owner" });
    }

    // Remove member from workspace
    workspace.members = workspace.members.filter(
      (member) => member.user.toString() !== userId
    );

    await workspace.save();

    // Populate the updated workspace
    await workspace.populate("members.user", "name email");
    await workspace.populate("owner", "name email");

    res.json({
      message: "Member removed successfully",
      workspace,
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ message: "Server error during member removal" });
  }
});

// Get all users (for invitation dropdown)
router.get("/users/search", auth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({ users: [] });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
      _id: { $ne: req.user.id }, // Exclude current user
    })
      .select("name email")
      .limit(10);

    res.json({ users });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ message: "Server error during user search" });
  }
});

module.exports = router;
