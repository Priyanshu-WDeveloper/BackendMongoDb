const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/delivery.controller.js");

router.route("/").get(deliveryController.suggestPincode);
router.route("/:pincode").get(deliveryController.checkDelivery);

module.exports = router;
