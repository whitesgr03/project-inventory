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
	const categories = await Category.find({}, { description: 0 })
		.sort({ name: 1 })
		.exec();

	res.render("categoryList", {
		title: "Category List",
		categories,
	});
});
const categoryDetail = asyncHandler(async (req, res, next) => {
	const [category, products] = await Promise.all([
		Category.findById(req.params.id).exec(),
		Product.find({ category: req.params.id }, { name: 1 })
			.sort({ name: 1 })
			.exec(),
	]);

	const categoryNotFound = () => {
		const err = new Error("Category not found");
		err.status = 404;
		return next(err);
	};

	category === null
		? categoryNotFound()
		: res.render("categoryDetail", {
				title: "Category Detail",
				category,
				products,
		  });
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
