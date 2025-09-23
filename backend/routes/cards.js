const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const Card = require("../models/Card");
const List = require("../models/List");
const Workspace = require("../models/Workspace");
const Activity = require("../models/Activity");
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

      // Create activity log
      await Activity.create({
        workspaceId: workspaceId,
        userId: req.user.id,
        action: `created card "${title}"`,
        timestamp: new Date(),
      });

      // Emit real-time update
      const io = req.app.get("io");
      if (io) {
        io.to(`workspace-${workspaceId}`).emit("card-created", {
          workspaceId: workspaceId,
          listId: listId,
          card: card,
          userId: req.user.id,
          userName: req.user.name,
        });
      }

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

// Reorder cards within the same list
router.put(
  "/reorder",
  [
    auth,
    body("listId").isMongoId().withMessage("Valid list ID is required"),
    body("cardOrder").isArray().withMessage("Card order array is required"),
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

      const { listId, cardOrder } = req.body;

      // Check if user has access to the list's workspace
      const list = await List.findById(listId).populate("workspaceId");
      if (!list) {
        return res.status(404).json({ message: "List not found" });
      }

      const workspace = await Workspace.findOne({
        _id: list.workspaceId,
        "members.user": req.user.id,
      });

      if (!workspace) {
        return res.status(403).json({ message: "Access denied" });
      }

      const cardsInList = await Card.find({ listId: listId });
      const listCardIds = cardsInList.map((card) => card._id.toString());

      console.log("Cards in list:", listCardIds);
      console.log("Card order received:", cardOrder);

      for (const cardId of cardOrder) {
        const cardIdStr = cardId.toString();
        if (!listCardIds.includes(cardIdStr)) {
          console.error(`Card ${cardId} does not belong to list ${listId}`);
          return res.status(400).json({
            message: `Card ${cardId} does not belong to this list`,
          });
        }
      }

      console.log("Updating card positions...");
      for (let i = 0; i < cardOrder.length; i++) {
        console.log(`Updating card ${cardOrder[i]} to position ${i + 1}`);
        await Card.findByIdAndUpdate(cardOrder[i], { position: i + 1 });
      }

      console.log("Updating list cardOrder array...");
      await List.findByIdAndUpdate(listId, {
        cardOrder: cardOrder,
      });

      console.log("Cards reordered successfully");

      // Emit real-time update
      const io = req.app.get("io");
      if (io) {
        io.to(`workspace-${workspace._id}`).emit("cards-reordered", {
          workspaceId: workspace._id,
          listId: listId,
          cardOrder: cardOrder,
          userId: req.user.id,
          userName: req.user.name,
        });
      }

      res.json({
        message: "Cards reordered successfully",
        listId: listId,
        cardOrder: cardOrder,
      });
    } catch (error) {
      console.error("Reorder cards error:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: "Server error during card reorder" });
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

      // Create activity log
      await Activity.create({
        workspaceId: card.workspaceId,
        userId: req.user.id,
        action: `updated card "${updatedCard.title}"`,
        timestamp: new Date(),
      });

      // Emit real-time update
      const io = req.app.get("io");
      if (io) {
        io.to(`workspace-${card.workspaceId}`).emit("card-updated", {
          workspaceId: card.workspaceId,
          cardId: cardId,
          card: updatedCard,
          userId: req.user.id,
          userName: req.user.name,
        });
      }

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
      const { targetListId, newPosition } = req.body;

      // Get the card and check if user has access
      const card = await Card.findById(cardId);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }

      // Check if user has access to the card's workspace
      const workspace = await Workspace.findOne({
        _id: card.workspaceId,
        "members.user": req.user.id,
      });

      if (!workspace) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if target list exists and belongs to the same workspace
      const targetList = await List.findOne({
        _id: targetListId,
        workspaceId: card.workspaceId,
      });

      if (!targetList) {
        return res.status(404).json({
          message: "Target list not found or doesn't belong to this workspace",
        });
      }

      const sourceListId = card.listId;
      const isMovingToDifferentList = sourceListId.toString() !== targetListId;

      if (isMovingToDifferentList) {
        // Moving to a different list
        // Remove card from source list
        await List.findByIdAndUpdate(sourceListId, {
          $pull: { cards: cardId, cardOrder: cardId },
        });

        // Add card to target list
        await List.findByIdAndUpdate(targetListId, {
          $push: { cards: cardId, cardOrder: cardId },
        });

        // Update card's listId
        card.listId = targetListId;
      }

      // Update card position
      card.position = newPosition;
      await card.save();

      // Reorder cards in the target list
      const cardsInList = await Card.find({ listId: targetListId }).sort({
        position: 1,
      });

      // Update positions to be sequential
      for (let i = 0; i < cardsInList.length; i++) {
        if (cardsInList[i]._id.toString() === cardId) {
          // Move the card to the desired position
          const cardToMove = cardsInList.splice(i, 1)[0];
          cardsInList.splice(newPosition, 0, cardToMove);
          break;
        }
      }

      // Update positions for all cards in the list
      for (let i = 0; i < cardsInList.length; i++) {
        await Card.findByIdAndUpdate(cardsInList[i]._id, { position: i + 1 });
      }

      // Update cardOrder array in the list
      const updatedCardOrder = cardsInList.map((c) => c._id);
      await List.findByIdAndUpdate(targetListId, {
        cardOrder: updatedCardOrder,
      });

      // Get the updated card with populated data
      const updatedCard = await Card.findById(cardId)
        .populate("assignedTo", "name email")
        .populate("listId", "title");

      // Emit real-time update
      const io = req.app.get("io");
      if (io) {
        io.to(`workspace-${workspace._id}`).emit("card-moved", {
          workspaceId: workspace._id,
          cardId: cardId,
          card: updatedCard,
          sourceListId: isMovingToDifferentList ? sourceListId : null,
          targetListId: targetListId,
          newPosition: newPosition,
          userId: req.user.id,
          userName: req.user.name,
        });
      }

      res.json({
        message: "Card moved successfully",
        card: updatedCard,
        sourceListId: isMovingToDifferentList ? sourceListId : null,
        targetListId: targetListId,
        newPosition: newPosition,
      });
    } catch (error) {
      console.error("Move card error:", error);
      res.status(500).json({ message: "Server error during card move" });
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

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(`workspace-${card.workspaceId}`).emit("card-deleted", {
        workspaceId: card.workspaceId,
        listId: card.listId,
        cardId: cardId,
        userId: req.user.id,
        userName: req.user.name,
      });
    }

    res.json({
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error("Delete card error:", error);
    res.status(500).json({ message: "Server error during card deletion" });
  }
});

module.exports = router;
