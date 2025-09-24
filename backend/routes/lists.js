const express = require("express");
const { body, validationResult } = require("express-validator");
const auth = require("../middleware/auth");
const listController = require("../controllers/listController");

const router = express.Router();

// Create a new list
router.post(
  "/",
  [
    auth,
    body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
    body("workspaceId")
      .isMongoId()
      .withMessage("Valid workspace ID is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    listController.createList(req, res);
  }
);

// Update a list
router.put(
  "/:listId",
  [
    auth,
    body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    listController.updateList(req, res);
  }
);

// Delete a list
router.delete("/:listId", auth, listController.deleteList);

module.exports = router;
