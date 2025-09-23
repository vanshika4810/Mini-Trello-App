const express = require("express");
const { body, validationResult } = require("express-validator");
const Card = require("../models/Card");
const List = require("../models/List");
const Workspace = require("../models/Workspace");
const auth = require("../middleware/auth");

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
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        title,
        description = "",
        listId,
        workspaceId,
        assignedTo,
        labels = [],
        dueDate,
      } = req.body;

      const workspace = await Workspace.findOne({
        _id: workspaceId,
        "members.user": req.user.id,
      });

      if (!workspace) {
        return res
          .status(404)
          .json({ message: "Workspace not found or access denied" });
      }

      const list = await List.findOne({
        _id: listId,
        workspaceId: workspaceId,
      });

      if (!list) {
        return res.status(404).json({
          message: "List not found or doesn't belong to this workspace",
        });
      }

      const maxPosition = await Card.findOne({ listId }).sort({ position: -1 });
      const position = maxPosition ? maxPosition.position + 1 : 1;

      const cardData = {
        title,
        description: description || "",
        listId,
        workspaceId,
        position,
        assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : null,
        labels: labels.map((label) => new mongoose.Types.ObjectId(label)),
        dueDate: dueDate ? new Date(dueDate) : null,
      };

      const card = await Card.create(cardData);

      await List.findByIdAndUpdate(listId, {
        $push: {
          cards: card._id,
          cardOrder: card._id,
        },
      });

      await card.populate("assignedTo", "name email");

      res.status(201).json({
        message: "Card created successfully",
        card,
      });
    } catch (error) {
      console.error("Create card error:", error);
      res.status(500).json({ message: "Server error during card creation" });
    }
  }
);

//  Update a card
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
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { cardId } = req.params;
      const { title, description, assignedTo, labels, dueDate } = req.body;

      const card = await Card.findById(cardId).populate("workspaceId");
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      const workspace = await Workspace.findOne({
        _id: card.workspaceId,
        "members.user": req.user.id,
      });
      if (!workspace) {
        return res.status(403).json({ message: "Access denied" });
      }
      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
      if (labels !== undefined) updateData.labels = labels;
      if (dueDate !== undefined)
        updateData.dueDate = dueDate ? new Date(dueDate) : null;

      const updatedCard = await Card.findByIdAndUpdate(cardId, updateData, {
        new: true,
      }).populate("assignedTo", "name email");

      res.json({
        message: "Card updated successfully",
        card: updatedCard,
      });
    } catch (error) {
      console.error("Update card error:", error);
      res.status(500).json({ message: "Server error during card update" });
    }
  }
);

// Delete a card
router.delete("/:cardId", auth, async (req, res) => {
  try {
    const { cardId } = req.params;

    // Check if user has access to the card's board
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found" });
    }
    const workspace = await Workspace.findOne({
      _id: card.workspaceId,
      "members.user": req.user.id,
    });
    if (!workspace) {
      return res.status(403).json({ message: "Access denied" });
    }
    await List.findByIdAndUpdate(card.listId, {
      $pull: { cards: cardId, cardOrder: cardId },
    });
    await Card.findByIdAndDelete(cardId);

    res.json({
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error("Delete card error:", error);
    res.status(500).json({ message: "Server error during card deletion" });
  }
});

module.exports = router;
