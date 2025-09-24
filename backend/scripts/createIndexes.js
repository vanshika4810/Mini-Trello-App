const mongoose = require("mongoose");
require("dotenv").config();

// Import all models to ensure indexes are created
const User = require("../models/User");
const Workspace = require("../models/Workspace");
const List = require("../models/List");
const Card = require("../models/Card");
const Comment = require("../models/Comment");
const Activity = require("../models/Activity");

async function createIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/mini-trello"
    );
    console.log("Connected to MongoDB");

    console.log("Creating indexes...");

    // Create indexes for all models
    await User.ensureIndexes();
    console.log("✅ User indexes created");

    await Workspace.ensureIndexes();
    console.log("✅ Workspace indexes created");

    await List.ensureIndexes();
    console.log("✅ List indexes created");

    await Card.ensureIndexes();
    console.log("✅ Card indexes created");

    await Comment.ensureIndexes();
    console.log("✅ Comment indexes created");

    await Activity.ensureIndexes();
    console.log("✅ Activity indexes created");

    console.log("\n🎉 All indexes created successfully!");
    console.log("\nIndexes created:");
    console.log("📊 User: email, name");
    console.log(
      "📊 Workspace: members.user, visibility, owner, compound indexes"
    );
    console.log("📊 List: workspaceId, position, compound indexes");
    console.log(
      "📊 Card: workspaceId, listId, assignedTo, text search, compound indexes"
    );
    console.log("📊 Comment: cardId, workspaceId, userId, compound indexes");
    console.log(
      "📊 Activity: workspaceId, userId, timestamp, compound indexes"
    );
  } catch (error) {
    console.error("Error creating indexes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
createIndexes();
