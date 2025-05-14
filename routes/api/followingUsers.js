const express = require("express");
const router = express.Router();
const followingUsersController = require("../../controllers/followingUsersController");

router.route("/").get(followingUsersController.getFollowingUsers);
module.exports = router;
