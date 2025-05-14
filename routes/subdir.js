const express = require("express");
const path = require("path");

const router = express.Router();

router.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
  // console.log(path.join(__dirname, "..", "views", "index.html"));
});
router.get("/test(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "test.html"));
});
// console.log("path", path.join(__dirname, "..", "views", "index.html"));

module.exports = router;
