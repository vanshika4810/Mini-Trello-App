const express = require("express");
const auth = require("../middleware/auth");
const activityController = require("../controllers/activityController");

const router = express.Router();

router.get("/workspace/:workspaceId", auth, activityController.getActivities);

module.exports = router;
