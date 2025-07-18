const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/usersController");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");

router
  .route("/")
  .get(
    verifyRoles(ROLES_LIST.User, ROLES_LIST.Editor, ROLES_LIST.Admin),
    usersController.getAllUsers
  )
  .delete(verifyRoles(ROLES_LIST.Admin), usersController.deleteUser);
// .put(verifyRoles(ROLES_LIST.Admin), usersController.updateUser)
// .delete(usersController.deleteUser);
router
  .route("/:id")
  .get(usersController.getUser)
  .put(verifyRoles(ROLES_LIST.Admin), usersController.updateUser); // deifne before if using params

module.exports = router;
