import { Types } from "mongoose";
import createError from "http-errors";
import asyncHandler from "express-async-handler";
import { validationResult, checkSchema, matchedData } from "express-validator";

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
const categoryDetail = asyncHandler(async (req, res, next) => {
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
		: next(createError(404, "Category not found", { type: "category" }));
});
const categoryCreateGet = async (req, res) =>
	res.render("categoryForm", {
		title: "Add a new category",
	});
const categoryCreatePost = asyncHandler(async (req, res) => {
	const validationSchema = {
		name: {
			trim: true,
			isLength: {
				options: { max: 30 },
				errorMessage: "The name must be less than 30 long.",
				bail: true,
			},
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
		},
	};
	await checkSchema(validationSchema, ["body"]).run(req);
	const schemaErrors = validationResult(req);
	const addNewCategory = async () => {
		const category = matchedData(req);
		const newCategory = new Category(category);
		const oneDay = 24 * 60 * 60 * 1000;

		newCategory.expiresAfter = new Date(Date.now() + oneDay);

		await newCategory.save();
		res.redirect(newCategory.url);
	};
	const renderErrorMessages = () => {
		res.render("categoryForm", {
			title: "Add a new category",
			category: {
				...req.body,
			},
			errors: schemaErrors.mapped(),
		});
	};
	schemaErrors.isEmpty() ? addNewCategory() : renderErrorMessages();
});
const categoryUpdateGet = asyncHandler(async (req, res, next) => {
	const category = await Category.findById(req.params.id).exec();

	category
		? !category?.expiresAfter
			? res.redirect(category.url)
			: res.render("categoryForm", {
					title: "Update category",
					category,
			  })
		: next(createError(404, "Category not found", { type: "category" }));
});
const categoryUpdatePost = asyncHandler(async (req, res, next) => {
	const category = await Category.findById(req.params.id).exec();
	const validationFields = async () => {
		const validationSchema = {
			name: {
				trim: true,
				isLength: {
					options: { max: 30 },
					errorMessage: "The name must be less than 30 long.",
					bail: true,
				},
				custom: {
					options: value =>
						new Promise(async (resolve, reject) => {
							const existingCategory = await Category.findOne({
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
							}).exec();
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
			},
		};

		await checkSchema(validationSchema, ["body"]).run(req);
		const schemaErrors = validationResult(req);

		const updateCategory = async () => {
			await Category.findByIdAndUpdate(req.params.id, {
				...matchedData(req),
			}).exec();
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
	};
	category
		? !category?.expiresAfter
			? res.redirect(category.url)
			: validationFields()
		: next(
				createError(404, "Category not found", {
					type: "category",
				})
		  );
});
const categoryDeleteGet = asyncHandler(async (req, res, next) => {
	const [category, products] = await Promise.all([
		Category.findById(req.params.id).exec(),
		Product.find({ category: req.params.id }, { name: 1 })
			.sort({ name: 1 })
			.exec(),
	]);

	const renderTemplate = () => {
		products.length
			? (res.locals.alert = true)
			: (res.locals.title = "Category delete");

		res.render("categoryDetail", {
			category,
			products,
		});
	};

	category
		? !category?.expiresAfter
			? res.redirect(category.url)
			: renderTemplate()
		: next(
				createError(404, "Category not found", {
					type: "category",
				})
		  );
});
const categoryDeletePost = asyncHandler(async (req, res, next) => {
	const [category, products] = await Promise.all([
		Category.findById(req.params.id).exec(),
		Product.find({ category: req.params.id }).exec(),
	]);

	const deleteCategory = async () => {
		await Category.findByIdAndDelete(req.params.id).exec();
		res.redirect("/inventory/categories");
	};

	category
		? !category?.expiresAfter
			? res.redirect(category.url)
			: !products.length && deleteCategory()
		: next(
				createError(404, "Category not found", {
					type: "category",
				})
		  );
});
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
