const { ObjectId } = require("mongodb");
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
	const validationSchema = {
		name: {
			trim: true,
			isLength: {
				options: { min: 1, max: 30 },
				errorMessage: "The name length must be 1 to 30.",
			},
			escape: true,
			custom: {
				options: value =>
					new Promise(async (resolve, reject) => {
						const existingCategory = await Category.findOne({
							name: value,
						}).exec();
						existingCategory ? reject() : resolve();
					}),
				errorMessage: "The name is been used.",
			},
		},
		description: {
			trim: true,
			notEmpty: { errorMessage: "The description must be input." },
			escape: true,
		},
	};

	await checkSchema(validationSchema, ["body"]).run(req);

	const schemaErrors = validationResult(req);

	const category = new Category({
		...req.body,
	});

	const tenMinutes = 10 * 60 * 1000;
	process.env.NODE_ENV === "production" &&
		(category.expiresAfter = new Date(Date.now() + tenMinutes));

	const addNewCategory = async () => {
		await category.save();
		res.redirect(category.url);
	};

	const renderErrorMessages = () => {
		res.render("categoryForm", {
			title: "Add a new category",
			category,
			errors: schemaErrors.mapped(),
		});
	};

	schemaErrors.isEmpty() ? addNewCategory() : renderErrorMessages();
});
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
const categoryUpdatePost = asyncHandler(async (req, res, next) => {
	const validationSchema = {
		name: {
			trim: true,
			isLength: {
				options: { min: 1, max: 30 },
				errorMessage: "The name length must be 1 to 30.",
			},
			escape: true,
			custom: {
				options: value =>
					new Promise(async (resolve, reject) => {
						const existingCategory = await Category.findOne({
							$and: [
								{ name: value },
								{ _id: { $ne: new ObjectId(req.params.id) } },
							],
						}).exec();
						existingCategory ? reject() : resolve();
					}),
				errorMessage: "The name is been used.",
			},
		},
		description: {
			trim: true,
			notEmpty: { errorMessage: "The description must be input." },
			escape: true,
		},
	};

	await checkSchema(validationSchema, ["body"]).run(req);

	const schemaErrors = validationResult(req);

	const category = new Category({
		_id: req.params.id,
		...req.body,
	});

	const updateCategory = async () => {
		await Category.findByIdAndUpdate(category._id, category);
		res.redirect(category.url);
	};

	const renderErrorMessages = () => {
		res.render("categoryForm", {
			title: "Update category",
			category,
			errors: schemaErrors.mapped(),
		});
	};

	schemaErrors.isEmpty() ? updateCategory() : renderErrorMessages();
});
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
