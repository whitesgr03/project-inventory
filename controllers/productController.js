const { ObjectId } = require("mongodb");
const asyncHandler = require("express-async-handler");
const createError = require("http-errors");
const { Storage } = require("@google-cloud/storage");
const { validationResult, checkSchema } = require("express-validator");
const { unescape } = require("validator");
const multer = require("multer");
const sharp = require("sharp");

const Product = require("../models/product");
const Category = require("../models/category");

const googleStorage = new Storage();
const uploadFile = multer({ storage: multer.memoryStorage() });
const bucketName =
	process.env.NODE_ENV === "development"
		? "project-inventory-bucket"
		: "project-inventory-user";

const productList = asyncHandler(async (req, res, next) => {
	const products = await Product.find({}, { name: 1 })
		.sort({ name: 1 })
		.exec();

	res.render("productList", {
		title: "Product List",
		products,
	});
});
const productDetail = async (req, res, next) => {
	try {
		const product = await Product.findById(req.params.id)
			.populate("category")
			.sort({ name: 1 })
			.exec();

		product
			? res.render("productDetail", {
					product,
			  })
			: next(createError(404, "Product not found", { type: "product" }));
	} catch (err) {
		next(
			createError(400, "Product not found", {
				cause: process.env.NODE_ENV === "development" ? err : {},
				type: "product",
			})
		);
	}
};
const productCreateGet = asyncHandler(async (req, res, next) => {
	const categories = await Category.find({}, { name: 1 })
		.sort({ name: 1 })
		.exec();

	res.render("productForm", {
		title: "Add a new product",
		categories,
	});
});
const productCreatePost = [
	uploadFile.single("image"),
	asyncHandler(async (req, res, next) => {
		const categories = await Category.find({}, { name: 1 })
			.sort({ name: 1 })
			.exec();

		const validationSchema = {
			name: {
				trim: true,
				isLength: {
					options: { min: 1, max: 100 },
					errorMessage: "The name must be less than 100 long.",
				},
				escape: true,
				custom: {
					options: value =>
						new Promise(async (resolve, reject) => {
							const existingProduct = await Product.findOne({
								name: value,
							}).exec();
							existingProduct ? reject() : resolve();
						}),
					errorMessage: "The name is been used.",
				},
			},
			category: {
				trim: true,
				escape: true,
				custom: {
					options: value =>
						typeof value === "string" &&
						categories.find(
							category => category._id.toString() === value
						),
					errorMessage: "The category must be chosen.",
				},
			},
			price: {
				trim: true,
				isFloat: {
					options: { min: 1 },
					errorMessage: "The price must be input.",
				},
				escape: true,
			},
			quantity: {
				trim: true,
				isInt: {
					options: { min: 1, max: 999 },
					errorMessage: "The quantity must be input.",
				},
				escape: true,
			},
			description: {
				trim: true,
				notEmpty: { errorMessage: "The description must be input." },
				escape: true,
			},
		};

		const nameFiled = req.body.name;

		await checkSchema(validationSchema, ["body"]).run(req);

		const schemaErrors = validationResult(req);

		const uploadImage = req.file;
		const imageInfo =
			uploadImage &&
			uploadImage.mimetype === "image/jpeg" &&
			(await sharp(uploadImage.buffer).metadata());

		const validateUploadImage = () => {
			const errorMessage = {
				msg: "The image is required, size must be less than 500 kb, width and height must be 800 or greater.",
			};

			return imageInfo
				? (imageInfo.size > 500000 ||
						imageInfo.width < 800 ||
						imageInfo.height < 800) &&
						errorMessage
				: errorMessage;
		};

		const uploadImageError = validateUploadImage();

		const product = {
			...req.body,
		};

		const createProduct = async () => {
			const currentTime = new Date();
			const uploadNewProductImage = async () => {
				const imageName = `${nameFiled.replace(
					/[^a-z0-9]+/gi,
					"-"
				)}-${+currentTime}.jpg`;

				const resizeImageBuffer = async () =>
					await sharp(uploadImage.buffer)
						.resize({ width: 800, height: 800 })
						.jpeg({ mozjpeg: true })
						.toBuffer();

				const imageBuffer =
					imageInfo.width > 800 || imageInfo.height > 800
						? await resizeImageBuffer()
						: uploadImage.buffer;

				await googleStorage
					.bucket(bucketName)
					.file(imageName)
					.save(imageBuffer);
			};
			const addNewProduct = async () => {
				const newProduct = new Product({
					...product,
					lastModified: currentTime,
				});

				const tenMinutes = 10 * 60 * 1000;
				process.env.NODE_ENV === "production" &&
					(newProduct.expiresAfter = new Date(
						Date.now() + tenMinutes
					));

				await newProduct.save();
				res.redirect(newProduct.url);
			};
			await uploadNewProductImage();
			await addNewProduct();
		};

		const renderErrorMessages = () => {
			const errors = schemaErrors.mapped();
			uploadImageError && (errors.image = uploadImageError);

			res.render("productForm", {
				title: "Add a new product",
				categories,
				product,
				errors,
			});
		};

		schemaErrors.isEmpty() && !uploadImageError
			? createProduct()
			: renderErrorMessages();
	}),
];
const productUpdateGet = async (req, res, next) => {
	try {
		const product = await Product.findById(req.params.id).exec();
		const categories = await Category.find({}, { name: 1 })
			.sort({ name: 1 })
			.exec();

		product
			? process.env.NODE_ENV === "development" || product.expiresAfter
				? res.render("productForm", {
						title: "Update product",
						categories,
						product,
				  })
				: res.redirect(product.url)
			: next(createError(404, "Product not found", { type: "product" }));
	} catch (err) {
		next(
			createError(400, "Product not found", {
				cause: process.env.NODE_ENV === "development" ? err : {},
				type: "product",
			})
		);
	}
};
const productUpdatePost = [
	uploadFile.single("image"),
	async (req, res, next) => {
		try {
			const currentProduct = await Product.findById(req.params.id).exec();
			const categories = await Category.find({}, { name: 1 })
				.sort({ name: 1 })
				.exec();
			const validationFields = async () => {
				const validationSchema = {
					name: {
						trim: true,
						isLength: {
							options: { min: 1, max: 100 },
							errorMessage:
								"The name must be less than 100 long.",
						},
						escape: true,
						custom: {
							options: value =>
								new Promise(async (resolve, reject) => {
									const existingProduct =
										await Product.findOne({
											$and: [
												{ name: value },
												{
													_id: {
														$ne: new ObjectId(
															req.params.id
														),
													},
												},
											],
										}).exec();

									existingProduct ? reject() : resolve();
								}),
							errorMessage: "The name is been used.",
						},
					},
					category: {
						trim: true,
						escape: true,
						custom: {
							options: value =>
								typeof value === "string" &&
								categories.find(
									category =>
										category._id.toString() === value
								),
							errorMessage: "The category must be chosen.",
						},
					},
					price: {
						trim: true,
						isFloat: {
							options: { min: 1 },
							errorMessage: "The price must be input.",
						},
						escape: true,
					},
					quantity: {
						trim: true,
						isInt: {
							options: { min: 1, max: 999 },
							errorMessage: "The quantity must be input.",
						},
						escape: true,
					},
					description: {
						trim: true,
						notEmpty: {
							errorMessage: "The description must be input.",
						},
						escape: true,
					},
				};

				const nameFiled = req.body.name;

				await checkSchema(validationSchema, ["body"]).run(req);

				const schemaErrors = validationResult(req);

				const uploadImage = req.file;
				const imageInfo =
					uploadImage &&
					uploadImage.mimetype === "image/jpeg" &&
					(await sharp(uploadImage.buffer).metadata());

				const validateUploadImage = () => {
					const errorMessage = {
						msg: "The image is required, size must be less than 500 kb, width and height must be 800 or greater.",
					};

					return (
						(!imageInfo ||
							imageInfo.size > 500000 ||
							imageInfo.width < 800 ||
							imageInfo.height < 800) &&
						errorMessage
					);
				};

				const uploadImageError = validateUploadImage();

				const product = {
					_id: req.params.id,
					...req.body,
				};

				const updateProduct = async () => {
					const currentTime = new Date();
					const deleteProductImage = async () => {
						const productImageName = `${unescape(
							currentProduct.name
						).replace(
							/[^a-z0-9]+/gi,
							"-"
						)}-${+currentProduct.lastModified}.jpg`;

						await googleStorage
							.bucket(bucketName)
							.file(productImageName)
							.delete();
					};

					const uploadNewProductImage = async () => {
						const newProductImageName = `${nameFiled.replace(
							/[^a-z0-9]+/gi,
							"-"
						)}-${+currentTime}.jpg`;
						const resizeImageBuffer = async () =>
							await sharp(uploadImage.buffer)
								.resize({ width: 800, height: 800 })
								.jpeg({ mozjpeg: true })
								.toBuffer();

						const imageBuffer =
							imageInfo.width > 800 || imageInfo.height > 800
								? await resizeImageBuffer()
								: uploadImage.buffer;

						await googleStorage
							.bucket(bucketName)
							.file(newProductImageName)
							.save(imageBuffer);
					};

					const editProduct = async () => {
						const newProduct = new Product({
							...product,
							lastModified: currentTime,
						});
						await Product.findByIdAndUpdate(
							product._id,
							newProduct
						).exec();
						res.redirect(newProduct.url);
					};

					await deleteProductImage();
					await uploadNewProductImage();
					await editProduct();
				};

				const renderErrorMessages = () => {
					const errors = schemaErrors.mapped();
					uploadImageError && (errors.image = uploadImageError);

					res.render("productForm", {
						title: "Update product",
						product,
						categories,
						errors,
					});
				};

				schemaErrors.isEmpty()
					? updateProduct()
					: renderErrorMessages();
			};
			currentProduct
				? process.env.NODE_ENV === "development" ||
				  currentProduct.expiresAfter
					? validationFields()
					: res.redirect(currentProduct.url)
				: next(
						createError(404, "Product not found", {
							type: "product",
						})
				  );
		} catch (err) {
			console.log("err", err);
			next(
				createError(400, "Product not found", {
					cause: process.env.NODE_ENV === "development" ? err : {},
					type: "product",
				})
			);
		}
	},
];
const productDeleteGet = async (req, res, next) => {
	try {
		const product = await Product.findById(req.params.id).exec();

		product
			? process.env.NODE_ENV === "development" || product.expiresAfter
				? res.render("productDetail", {
						title: "Product delete",
						product,
				  })
				: res.redirect(product.url)
			: next(
					createError(404, "Product not found", {
						type: "product",
					})
			  );
	} catch (err) {
		next(
			createError(400, "Product not found", {
				cause: process.env.NODE_ENV === "development" ? err : {},
				type: "product",
			})
		);
	}
};
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
