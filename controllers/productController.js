const asyncHandler = require("express-async-handler");
const { Storage } = require("@google-cloud/storage");
const { validationResult, checkSchema } = require("express-validator");
const { unescape } = require("validator");
const multer = require("multer");
const sharp = require("sharp");

const Product = require("../models/product");
const Category = require("../models/category");

const uploadFile = multer({ storage: multer.memoryStorage() });

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
	const product = await Product.findById(req.params.id)
		.populate("category")
		.sort({ name: 1 })
		.exec();

	const productNotFound = () => {
		const err = new Error("Product not found");
		err.status = 404;
		return next(err);
	};

	product === null
		? productNotFound()
		: res.render("productDetail", {
				title: "Product Detail",
				product,
		  });
});
const productCreateGet = asyncHandler(async (req, res, next) => {
	const categories = await Category.find({}, { description: 0 })
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
		const categories = await Category.find({}, { description: 0 })
			.sort({ name: 1 })
			.exec();

		const validationSchema = {
			name: {
				errorMessage: "The name must be less than 100 long.",
				trim: true,
				isLength: { options: { min: 1, max: 100 } },
				escape: true,
			},
			category: {
				errorMessage: "The category must be chosen.",
				trim: true,
				custom: {
					options: categoryId =>
						typeof categoryId === "string" &&
						categories.find(
							category => category._id.toString() === categoryId
						),
				},
				escape: true,
			},
			price: {
				errorMessage: "The price must be input.",
				trim: true,
				isFloat: { options: { min: 1 } },
				escape: true,
			},
			quantity: {
				errorMessage: "The quantity must be input.",
				trim: true,
				isInt: { options: { min: 1, max: 999 } },
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

		const inputErrors = validationResult(req);

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

		const product =
			process.env.NODE_ENV === "development"
				? new Product({
						...req.body,
				  })
				: new Product({
						...req.body,
						expiresAfter: new Date(Date.now + 10 * 60 * 1000),
				  });

		const isProductExist = async () => {
			const existingProduct = await Product.findOne({
				name: req.body.name,
			}).exec();

			const uploadFile = async () => {
				const resizeImageBuffer = async () =>
					await sharp(uploadImage.buffer)
						.resize({ width: 800, height: 800 })
						.jpeg({ mozjpeg: true })
						.toBuffer();
				const googleStorage = new Storage();
				const bucketName =
					process.env.NODE_ENV === "development"
						? "project-inventory-bucket"
						: "project-inventory-user";
				const imageName = `${unescape(product.name).replace(
					/[^a-z0-9]+/gi,
					"-"
				)}.jpg`;
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
				await product.save();
				res.redirect(product.url);
			};

			const createProduct = async () => {
				await uploadFile();
				await addNewProduct();
			};

			existingProduct
				? res.redirect(existingProduct.url)
				: await createProduct();
		};
		const renderErrorMessages = () => {
			const errors = inputErrors.mapped();
			uploadImageError && (errors.image = uploadImageError);

			res.render("productForm", {
				title: "Add a new product",
				categories,
				product,
				errors,
			});
		};

		inputErrors.isEmpty() && !uploadImageError
			? isProductExist()
			: renderErrorMessages();
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
