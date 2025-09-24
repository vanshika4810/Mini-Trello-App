const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const cardController = require("../controllers/cardController");

const router = express.Router();

// Create a new card
router.post(
  "/",
  [
    auth,
    body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
    body("description").optional().trim(),
    body("listId").isMongoId().withMessage("Valid list ID is required"),
    body("workspaceId").isMongoId().withMessage("Valid board ID is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    cardController.createCard(req, res);
  }
);

// Reorder cards within the same list
router.put(
  "/reorder",
  [
    auth,
    body("listId").isMongoId().withMessage("Valid list ID is required"),
    body("cardOrder").isArray().withMessage("Card order array is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    cardController.reorderCards(req, res);
  }
);

// Update a card
router.put(
  "/:cardId",
  [
    auth,
    body("title").optional().trim().isLength({ min: 1 }),
    body("description").optional().trim(),
    body("assignedTo")
      .optional()
      .custom((value) => {
        if (value === null || value === "" || value === undefined) return true;
        return /^[0-9a-fA-F]{24}$/.test(value);
      }),
    body("labels").optional().isArray(),
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
    cardController.updateCard(req, res);
  }
);

// Move a card to a new position or different list
router.put(
  "/:cardId/move",
  [
    auth,
    body("targetListId")
      .isMongoId()
      .withMessage("Valid target list ID is required"),
    body("newPosition")
      .isInt({ min: 0 })
      .withMessage("Valid position is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    cardController.moveCard(req, res);
  }
);

// Delete a card
router.delete("/:cardId", auth, cardController.deleteCard);

module.exports = router;
