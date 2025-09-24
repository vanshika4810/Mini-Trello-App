const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const workspaceController = require("../controllers/workspaceController");

const router = express.Router();

// Create a new workspace
router.post(
  "/",
  [
    auth,
    body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
    body("visibility")
      .isIn(["public", "private"])
      .withMessage("Visibility must be public or private"),
    body("dueDate").optional().isISO8601(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    workspaceController.createWorkspace(req, res);
  }
);

// Get all workspaces for a user
router.get("/", auth, workspaceController.getWorkspaces);

// Get a specific workspace
router.get("/:workspaceId", auth, workspaceController.getWorkspace);

// Toggle workspace visibility
router.put(
  "/:workspaceId/visibility",
  [
    auth,
    body("visibility")
      .isIn(["public", "private"])
      .withMessage("Visibility must be public or private"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    workspaceController.toggleVisibility(req, res);
  }
);

// Add member to workspace
router.post(
  "/:workspaceId/members",
  [
    auth,
    body("userEmail").isEmail().withMessage("Valid email is required"),
    body("role")
      .optional()
      .isIn(["admin", "member"])
      .withMessage("Role must be admin or member"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    workspaceController.addMember(req, res);
  }
);

// Remove member from workspace
router.delete(
  "/:workspaceId/members/:userId",
  auth,
  workspaceController.removeMember
);

// Reorder lists in workspace
router.put(
  "/:workspaceId/reorder-lists",
  [
    auth,
    body("listOrder").isArray().withMessage("List order array is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    // Add workspaceId from params to body for the controller
    req.body.workspaceId = req.params.workspaceId;
    workspaceController.reorderLists(req, res);
  }
);

// Delete workspace
router.delete("/:workspaceId", auth, workspaceController.deleteWorkspace);

module.exports = router;
