const asyncHandler = require("express-async-handler");

const Category = require("../models/category");
const Product = require("../models/product");

const index = asyncHandler(async (req, res, next) => {
	const numCategories = Category.countDocuments().exec();
	const numProducts = Product.countDocuments().exec();

	res.render("index", {
		categories_count: await numCategories,
		products_count: await numProducts,
	});
});

const categoryList = asyncHandler(async (req, res, next) => {
	const categories = await Category.find({}, { _id: 0, description: 0 })
		.sort({ name: 1 })
		.exec();

	res.render("categoryList", {
		title: "Category List",
		categories,
	});
});
const categoryDetail = asyncHandler(async (req, res, next) => {
	res.send("This is category detail page");
});
const categoryCreateGet = asyncHandler(async (req, res, next) => {
	res.send("This is category create get page");
});
const categoryCreatePost = asyncHandler(async (req, res, next) => {
	res.send("This is category create post page");
});
const categoryUpdateGet = asyncHandler(async (req, res, next) => {
	res.send("This is category update get page");
});
const categoryUpdatePost = [
	asyncHandler(async (req, res, next) => {
		res.send("This is category update post page");
	}),
];
const categoryDeleteGet = asyncHandler(async (req, res, next) => {
	res.send("This is category delete get page");
});
const categoryDeletePost = [
	asyncHandler(async (req, res, next) => {
		res.send("This is category update post page");
	}),
];

module.exports = {
	index,
	categoryList,
	categoryDetail,
	categoryCreateGet,
	categoryCreatePost,
	categoryUpdateGet,
	categoryUpdatePost,
	categoryDeleteGet,
	categoryDeletePost,
};
