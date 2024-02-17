const asyncHandler = require("express-async-handler");


const goodsList = asyncHandler(async (req, res, next) => {
	res.send("This is goods list page");
});
const goodsDetail = asyncHandler(async (req, res, next) => {
	res.send("This is goods detail page");
});
const goodsCreateGet = asyncHandler(async (req, res, next) => {
	res.send("This is goods create get page");
});
const goodsCreatePost = asyncHandler(async (req, res, next) => {
	res.send("This is goods create post page");
});
const goodsUpdateGet = asyncHandler(async (req, res, next) => {
	res.send("This is goods update get page");
});
const goodsUpdatePost = [
	asyncHandler(async (req, res, next) => {
		res.send("This is goods update post page");
	}),
];
const goodsDeleteGet = asyncHandler(async (req, res, next) => {
	res.send("This is goods delete get page");
});
const goodsDeletePost = [
	asyncHandler(async (req, res, next) => {
		res.send("This is goods update post page");
	}),
];

module.exports = {
	goodsList,
	goodsDetail,
	goodsCreateGet,
	goodsCreatePost,
	goodsUpdateGet,
	goodsUpdatePost,
	goodsDeleteGet,
	goodsDeletePost,
};
