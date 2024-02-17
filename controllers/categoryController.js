const asyncHandler = require("express-async-handler");


const categoryList = asyncHandler(async (req, res, next) => {
	res.send("This is category list page");
});
const categoryDetail = asyncHandler(async (req, res, next) => {
	res.send("This is category detail page");
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
	categoryList,
	categoryDetail,
	categoryCreateGet,
	categoryCreatePost,
	categoryUpdateGet,
	categoryUpdatePost,
	categoryDeleteGet,
	categoryDeletePost,
};
