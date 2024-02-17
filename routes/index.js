const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");

router.get(
	"/",
	asyncHandler(async (req, res, next) => {
		res.send("This is index page");
	})
);

module.exports = router;
