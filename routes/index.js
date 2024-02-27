const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");

const Category = require("../models/category");
const Products = require("../models/product");

router.get(
	"/",
	asyncHandler(async (req, res, next) => {
		const numCategories = Category.countDocuments().exec();
		const numProducts = Products.countDocuments().exec();

		res.render("index", {
			title: "Project Y",
			categories_count: await numCategories,
			products_count: await numProducts,
		});
	})
);

module.exports = router;
