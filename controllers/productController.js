import sharp from "sharp";
import multer from "multer";
import { Types } from "mongoose";
import createError from "http-errors";
import { Storage } from "@google-cloud/storage";
import asyncHandler from "express-async-handler";
import { validationResult, checkSchema, matchedData } from "express-validator";

import Category from "../models/category.js";
import Product from "../models/product.js";

import { encodeFile } from "../utils/handleImage.js";

const googleStorage = new Storage({
	credentials: {
		type: process.env.GADCTYPE,
		project_id: process.env.GADCID,
		private_key_id: process.env.GADCPRIVATEKEYID,
		private_key: process.env.GADCIDPRIVATEKEY.replace(/\\n/g, "\n"),
		client_email: process.env.GADCCLIENTEMAIL,
		client_id: process.env.GADCCLIENTID,
		auth_uri: process.env.GADCAUTHURI,
		token_uri: process.env.GADCTOKENURI,
		auth_provider_x509_cert_url: process.env.GADCAUTHPROVIDERX509,
		client_x509_cert_url: process.env.GADCCLIENTX509,
		universe_domain: process.env.GADCUNIVERSEDOMAIN,
	},
});
const bucketName = "project-inventory-user";
const uploadFile = multer({ storage: multer.memoryStorage() });

const productList = asyncHandler(async (req, res) => {
	const products = await Product.find({}, { name: 1 })
		.sort({ name: 1 })
		.exec();

	res.render("productList", {
		title: "Product List",
		products,
	});
});
const productDetail = asyncHandler(async (req, res, next) => {
	const product = await Product.findById(req.params.id)
		.populate("category")
		.exec();

	product
		? res.render("productDetail", {
				product,
		  })
		: next(createError(404, "Product not found", { type: "product" }));
});
const productCreateGet = asyncHandler(async (req, res) => {
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
	asyncHandler(async (req, res) => {
		const categories = await Category.find({}, { name: 1 })
			.sort({ name: 1 })
			.exec();
		const validationSchema = {
			name: {
				trim: true,
				isLength: {
					options: { max: 100 },
					errorMessage: "The name must be less than 100 long.",
					bail: true,
				},
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
				custom: {
					options: value =>
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
					errorMessage: "The price is required.",
				},
			},
			quantity: {
				trim: true,
				isInt: {
					options: { min: 1, max: 999 },
					errorMessage: "The quantity is required.",
				},
			},
			description: {
				trim: true,
				notEmpty: { errorMessage: "The description is required." },
			},
		};
		await checkSchema(validationSchema, ["body"]).run(req);
		const schemaErrors = validationResult(req);

		const { file } = req;
		const imageInfo =
			file?.mimetype === "image/jpeg" &&
			(await sharp(file.buffer).metadata());
		const imageError =
			!imageInfo ||
			imageInfo.size > 500000 ||
			imageInfo.width < 800 ||
			imageInfo.height < 800;

		const createProduct = async () => {
			const oneDay = 24 * 60 * 60;
			const product = matchedData(req);

			let newProductUrl = null;
			const uploadNewProductImage = async () => {
				const fileName = encodeFile(product.name);

				const handleImageBuffer = async () =>
					imageInfo.width === 800 && imageInfo.height === 800
						? file.buffer
						: await sharp(file.buffer)
								.resize({ width: 800, height: 800 })
								.jpeg({ mozjpeg: true })
								.toBuffer();

				await googleStorage
					.bucket(bucketName)
					.file(fileName)
					.save(await handleImageBuffer(), {
						metadata: {
							contentType: file.mimetype,
							cacheControl: `public, max-age=${oneDay}`,
						},
					});
			};
			const addNewProduct = async () => {
				const currentTime = new Date();
				const newProduct = new Product({
					...product,
					lastModified: currentTime,
					expiresAfter: new Date(
						currentTime.getTime() + oneDay * 1000
					),
				});

				await newProduct.save();
				newProductUrl = newProduct.url;
			};
			await Promise.all([uploadNewProductImage(), addNewProduct()]);
			res.redirect(newProductUrl);
		};
		const renderErrorMessages = () => {
			const errors = schemaErrors.mapped();
			imageError &&
				(errors.image = {
					msg: "The image is required, size must be less than 500 kb, width and height must be 800 or greater.",
				});
			res.render("productForm", {
				title: "Add a new product",
				categories,
				product: {
					...req.body,
					category: Types.ObjectId.createFromHexString(
						req.body.category
					),
				},
				errors,
			});
		};

		schemaErrors.isEmpty() && !imageError
			? createProduct()
			: renderErrorMessages();
	}),
];
const productUpdateGet = asyncHandler(async (req, res, next) => {
	const product = await Product.findById(req.params.id).exec();
	const categories = await Category.find({}, { name: 1 })
		.sort({ name: 1 })
		.exec();

	product
		? !product?.expiresAfter
			? res.redirect(product.url)
			: res.render("productForm", {
					title: "Update product",
					categories,
					product,
			  })
		: next(createError(404, "Product not found", { type: "product" }));
});
const productUpdatePost = [
	uploadFile.single("image"),
	asyncHandler(async (req, res, next) => {
		const product = await Product.findById(req.params.id).exec();
		const categories = await Category.find({}, { name: 1 })
			.sort({ name: 1 })
			.exec();
		const validationFields = async () => {
			const validationSchema = {
				name: {
					trim: true,
					isLength: {
						options: { max: 100 },
						errorMessage: "The name must be less than 100 long.",
					},
					custom: {
						options: value =>
							new Promise(async (resolve, reject) => {
								const existingProduct = await Product.findOne({
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
								existingProduct ? reject() : resolve();
							}),
						errorMessage: "The name is been used.",
					},
				},
				category: {
					trim: true,
					custom: {
						options: value =>
							categories.find(
								category => category._id.toString() === value
							),
						errorMessage: "The category is required.",
					},
				},
				price: {
					trim: true,
					isFloat: {
						options: { min: 1 },
						errorMessage: "The price is required.",
					},
				},
				quantity: {
					trim: true,
					isInt: {
						options: { min: 1, max: 999 },
						errorMessage: "The quantity is required.",
					},
				},
				description: {
					trim: true,
					notEmpty: {
						errorMessage: "The description is required.",
					},
				},
			};

			await checkSchema(validationSchema, ["body"]).run(req);

			const schemaErrors = validationResult(req);

			const { file } = req;

			const imageInfo =
				file?.mimetype === "image/jpeg" &&
				(await sharp(file.buffer).metadata());
			const imageError =
				!imageInfo ||
				imageInfo.size > 500000 ||
				imageInfo.width < 800 ||
				imageInfo.height < 800;

			const updateProduct = async () => {
				const oneDay = 24 * 60 * 60;
				const oldProduct = product;
				const newProduct = matchedData(req);
				const fileName = encodeFile(newProduct.name);

				const RenameProductImage = async () => {
					const oldFileName = encodeFile(oldProduct.name);
					await googleStorage
						.bucket(bucketName)
						.file(oldFileName)
						.move(fileName);
				};
				const handleUpdateImage = async () => {
					const handleImageBuffer = async () =>
						imageInfo.width === 800 && imageInfo.height === 800
							? file.buffer
							: await sharp(file.buffer)
									.resize({ width: 800, height: 800 })
									.jpeg({ mozjpeg: true })
									.toBuffer();

					await googleStorage
						.bucket(bucketName)
						.file(fileName)
						.save(await handleImageBuffer(), {
							metadata: {
								contentType: file.mimetype,
								cacheControl: `public, max-age=${oneDay}`,
							},
						});
				};
				const editProduct = async () => {
					await Product.findByIdAndUpdate(product._id, {
						...newProduct,
						lastModified: new Date(),
					}).exec();
				};

				await Promise.all([
					file && handleUpdateImage(),
					!file &&
						oldProduct.name !== newProduct.name &&
						RenameProductImage(),
					editProduct(),
				]);
				res.redirect(product.url);
			};

			const renderErrorMessages = () => {
				const errors = schemaErrors.mapped();
				file &&
					imageError &&
					(errors.image = {
						msg: "The image is required, size must be less than 500 kb, width and height must be 800 or greater.",
					});
				res.render("productForm", {
					title: "Update product",
					product: {
						...req.body,
						_id: req.params.id,
						category: Types.ObjectId.createFromHexString(
							req.body.category
						),
						imageUrl: product.imageUrl,
					},
					categories,
					errors,
				});
			};

			schemaErrors.isEmpty() && (!file || !imageError)
				? updateProduct()
				: renderErrorMessages();
		};
		product
			? !product?.expiresAfter
				? res.redirect(product.url)
				: validationFields()
			: next(
					createError(404, "Product not found", {
						type: "product",
					})
			  );
	}),
];
const productDeleteGet = asyncHandler(async (req, res, next) => {
	const product = await Product.findById(req.params.id).exec();

	product
		? !product?.expiresAfter
			? res.redirect(product.url)
			: res.render("productDetail", {
					title: "Product delete",
					product,
			  })
		: next(
				createError(404, "Product not found", {
					type: "product",
				})
		  );
});
const productDeletePost = asyncHandler(async (req, res, next) => {
	const product = await Product.findById(req.params.id).exec();

	const handleDelete = async () => {
		const deleteProductImage = async () => {
			await googleStorage
				.bucket(bucketName)
				.file(encodeFile(product.name))
				.delete();
		};

		await Product.findByIdAndDelete(req.params.id)
			.exec()
			.then(async () => await deleteProductImage());

		res.redirect("/inventory/products");
	};

	product
		? !product?.expiresAfter
			? res.redirect(product.url)
			: handleDelete()
		: next(
				createError(404, "Product not found", {
					type: "product",
				})
		  );
});
export {
	productList,
	productDetail,
	productCreateGet,
	productCreatePost,
	productUpdateGet,
	productUpdatePost,
	productDeleteGet,
	productDeletePost,
};
