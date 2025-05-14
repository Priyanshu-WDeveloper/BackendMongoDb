const express = require("express");
const router = express.Router();
const employeesControllers = require("../../controllers/employeesControllers");
const ROLES_LIST = require("../../config/roles_list");
const verifyRoles = require("../../middleware/verifyRoles");
router
  .route("/")
  .get(employeesControllers.getAllEmployees)
  .post(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    employeesControllers.createNewEmployee
  )
  .put(
    verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),
    employeesControllers.updateEmployee
  )
  .delete(verifyRoles(ROLES_LIST.Admin), employeesControllers.deleteEmployee);
router.route("/:id").get(employeesControllers.getEmployee);

module.exports = router;
