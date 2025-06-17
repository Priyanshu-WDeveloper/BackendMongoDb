const express = require("express");
const router = express.Router();
const logoutController = require("../controllers/logout.controller.js");
const verifyJWT = require("../middleware/verifyJWT.js");

router.get("/", logoutController.handleLogout);

module.exports = router;
