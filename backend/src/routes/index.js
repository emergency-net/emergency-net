const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("<html><body><h1>Hello World!</h1></body></html>");
});

module.exports = router;
