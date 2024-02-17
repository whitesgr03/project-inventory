const asyncHandler = require("express-async-handler");


const productList = asyncHandler(async (req, res, next) => {
	res.send("This is product list page");
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
