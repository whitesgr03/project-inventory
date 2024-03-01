const asyncHandler = require("express-async-handler");

const Product = require("../models/product");

const productList = asyncHandler(async (req, res, next) => {
	const products = await Product.find({}, { name: 1 })
		.sort({ name: 1 })
		.exec();

	res.render("productList", {
		title: "Product List",
		products,
	});
});
const productDetail = asyncHandler(async (req, res, next) => {
	res.send("This is product detail page");
});
const productCreateGet = asyncHandler(async (req, res, next) => {
	res.send("This is product create get page");
});
const productCreatePost = [
	asyncHandler(async (req, res, next) => {
		res.send("This is product create post page");
	}),
];
const productUpdateGet = asyncHandler(async (req, res, next) => {
	res.send("This is product update get page");
});
const productUpdatePost = [
	asyncHandler(async (req, res, next) => {
		res.send("This is product update post page");
	}),
];
const productDeleteGet = asyncHandler(async (req, res, next) => {
	res.send("This is product delete get page");
});
const productDeletePost = [
	asyncHandler(async (req, res, next) => {
		res.send("This is product update post page");
	}),
];

module.exports = {
	productList,
	productDetail,
	productCreateGet,
	productCreatePost,
	productUpdateGet,
	productUpdatePost,
	productDeleteGet,
	productDeletePost,
};
