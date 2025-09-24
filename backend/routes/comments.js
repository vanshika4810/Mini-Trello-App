const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const commentController = require("../controllers/commentController");

const router = express.Router();

// Get comments for a card
router.get("/card/:cardId", auth, commentController.getComments);

// Create a new comment
router.post(
  "/",
  [
    auth,
    body("cardId").isMongoId().withMessage("Valid card ID is required"),
    body("content")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Content is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    commentController.createComment(req, res);
  }
);

// Update a comment
router.put(
  "/:commentId",
  [
    auth,
    body("content")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Content is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    commentController.updateComment(req, res);
  }
);

// Delete a comment
router.delete("/:commentId", auth, commentController.deleteComment);

module.exports = router;
