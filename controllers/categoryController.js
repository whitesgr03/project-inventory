const asyncHandler = require("express-async-handler");
const createError = require("http-errors");
const { validationResult, checkSchema } = require("express-validator");

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
const categoryDetail = async (req, res, next) => {
	try {
		const [category, products] = await Promise.all([
			Category.findById(req.params.id).exec(),
			Product.find({ category: req.params.id }, { name: 1 })
				.sort({ name: 1 })
				.exec(),
		]);

		category === null
			? next(createError(404, "Category not found", { type: "category" }))
			: res.render("categoryDetail", {
					title: "Category Detail",
					category,
					products,
			  });
	} catch (err) {
		next(
			createError(400, "Category not found", {
				cause: process.env.NODE_ENV === "development" ? err : {},
				type: "category",
			})
		);
	}
};
const categoryCreateGet = asyncHandler(async (req, res, next) => {
	res.render("categoryForm", {
		title: "Add a new category",
	});
});
const categoryCreatePost = asyncHandler(async (req, res, next) => {
const categoryUpdateGet = async (req, res, next) => {
	try {
		const category = await Category.findById(req.params.id).exec();

		category === null
			? next(createError(404, "Category not found", { type: "category" }))
			: res.render("categoryForm", {
					title: "Update category",
					category,
			  });
	} catch (err) {
		next(
			createError(400, "Category not found", {
				cause: process.env.NODE_ENV === "development" ? err : {},
				type: "category",
			})
		);
	}
};
	const validationSchema = {
		name: {
			errorMessage: "The name length must be 1 to 30.",
			trim: true,
			isLength: { options: { min: 1, max: 30 } },
			escape: true,
		},
		description: {
			errorMessage: "The description must be input.",
			trim: true,
			notEmpty: true,
			escape: true,
		},
	};

	await checkSchema(validationSchema, ["body"]).run(req);

	const schemaErrors = validationResult(req);

	const category =
		process.env.NODE_ENV === "development"
			? new Category({
					...req.body,
			  })
			: new Category({
					...req.body,
					expiresAfter: new Date(Date.now() + 10 * 60 * 1000),
			  });

	const isCategoryExist = async () => {
		const existingCategory = await Category.findOne({
			name: req.body.name,
		}).exec();

		const addNewCategory = async () => {
			await category.save();
			res.redirect(category.url);
		};

		existingCategory
			? res.redirect(existingCategory.url)
			: await addNewCategory();
	};
	const renderErrorMessages = () => {
		res.render("categoryForm", {
			title: "Add a new category",
			category,
			errors: schemaErrors.mapped(),
		});
	};

	schemaErrors.isEmpty() ? isCategoryExist() : renderErrorMessages();
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
