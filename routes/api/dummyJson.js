const express = require("express");
const router = express.Router();
const dummpJsonController = require("../../controllers/dummpJsonController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");
router.all("*", dummpJsonController.proxyDummyJson);

module.exports = router;
