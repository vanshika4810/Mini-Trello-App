const express = require("express");
const auth = require("../middleware/auth");
const searchController = require("../controllers/searchController");

const router = express.Router();

// Search cards in a workspace
router.get("/workspace/:workspaceId", auth, searchController.searchCards);

module.exports = router;
