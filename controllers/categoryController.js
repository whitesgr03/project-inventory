import { Types } from "mongoose";
import createError from "http-errors";
import asyncHandler from "express-async-handler";
import { validationResult, checkSchema } from "express-validator";

import Category from "../models/category.js";
import Product from "../models/product.js";

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

		category
			? res.render("categoryDetail", {
					category,
					products,
			  })
			: next(
					createError(404, "Category not found", { type: "category" })
			  );
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

	const category = {
		...req.body,
	};

	const addNewCategory = async () => {
		const newCategory = new Category(category);

		const tenMinutes = 10 * 60 * 1000;
		process.env.NODE_ENV === "production" &&
			(newCategory.expiresAfter = new Date(Date.now() + tenMinutes));

		await newCategory.save();
		res.redirect(newCategory.url);
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

		category
			? process.env.NODE_ENV === "development" || category.expiresAfter
				? res.render("categoryForm", {
						title: "Update category",
						category,
				  })
				: res.redirect(category.url)
			: next(
					createError(404, "Category not found", { type: "category" })
			  );
	} catch (err) {
		next(
			createError(400, "Category not found", {
				cause: process.env.NODE_ENV === "development" ? err : {},
				type: "category",
			})
		);
	}
};
const categoryUpdatePost = async (req, res, next) => {
	try {
		const category = await Category.findById(req.params.id).exec();
		const validationFields = async () => {
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
								const existingCategory = await Category.findOne(
									{
										$and: [
											{ name: value },
											{
												_id: {
													$ne: Types.ObjectId.createFromHexString(
														req.params.id
													),
												},
											},
										],
									}
								).exec();
								existingCategory ? reject() : resolve();
							}),
						errorMessage: "The name is been used.",
					},
				},
				description: {
					trim: true,
					notEmpty: {
						errorMessage: "The description must be input.",
					},
					escape: true,
				},
			};

			await checkSchema(validationSchema, ["body"]).run(req);

			const schemaErrors = validationResult(req);

			const newCategory = new Category({
				_id: req.params.id,
				...req.body,
			});

			const updateCategory = async () => {
				await Category.findByIdAndUpdate(
					newCategory._id,
					newCategory
				).exec();
				res.redirect(newCategory.url);
			};

			const renderErrorMessages = () => {
				res.render("categoryForm", {
					title: "Update category",
					category: newCategory,
					errors: schemaErrors.mapped(),
				});
			};

			schemaErrors.isEmpty() ? updateCategory() : renderErrorMessages();
		};

		category
			? process.env.NODE_ENV === "development" || category.expiresAfter
				? validationFields()
				: res.redirect(category.url)
			: next(
					createError(404, "Category not found", {
						type: "category",
					})
			  );
	} catch (err) {
		next(
			createError(400, "Category not found", {
				cause: process.env.NODE_ENV === "development" ? err : {},
				type: "category",
			})
		);
	}
};
const categoryDeleteGet = async (req, res, next) => {
	try {
		const [category, products] = await Promise.all([
			Category.findById(req.params.id).exec(),
			Product.find({ category: req.params.id }, { name: 1 })
				.sort({ name: 1 })
				.exec(),
		]);

		const renderTemplate = () => {
			const locals = {
				category,
				products,
			};

			products.length && (locals.remove = true);
			!products.length && (locals.title = "Category delete");

			res.render("categoryDetail", locals);
		};

		category
			? process.env.NODE_ENV === "development" || category.expiresAfter
				? renderTemplate()
				: res.redirect(category.url)
			: next(
					createError(404, "Category not found", {
						type: "category",
					})
			  );
	} catch (err) {
		next(
			createError(400, "Category not found", {
				cause: process.env.NODE_ENV === "development" ? err : {},
				type: "category",
			})
		);
	}
};
const categoryDeletePost = async (req, res, next) => {
	try {
		const [category, products] = await Promise.all([
			Category.findById(req.params.id).exec(),
			Product.find({ category: req.params.id }).exec(),
		]);

		const deleteCategory = async () => {
			await Category.findByIdAndDelete(req.params.id).exec();
			res.redirect("/inventory/categories");
		};

		category
			? process.env.NODE_ENV === "development" ||
			  (category.expiresAfter && !products.length)
				? deleteCategory()
				: res.redirect(category.url)
			: next(
					createError(404, "Category not found", {
						type: "category",
					})
			  );
	} catch (err) {
		next(
			createError(400, "Category not found", {
				cause: process.env.NODE_ENV === "development" ? err : {},
				type: "category",
			})
		);
	}
};
export {
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
