const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");

router
	.route("/category/create")
	.get(categoryController.categoryCreateGet)
	.post(categoryController.categoryCreatePost);
router
	.route("/category/:id/update")
	.get(categoryController.categoryUpdateGet)
	.post(categoryController.categoryUpdatePost);
router
	.route("/category/:id/delete")
	.get(categoryController.categoryDeleteGet)
	.post(categoryController.categoryDeletePost);
router.get("/category/:id", categoryController.categoryDetail);
router.get("/categories", categoryController.categoryList);

router
	.route("/product/create")
	.get(productController.productCreateGet)
	.post(productController.productCreatePost);
router
	.route("/product/:id/update")
	.get(productController.productUpdateGet)
	.post(productController.productUpdatePost);
router
	.route("/product/:id/delete")
	.get(productController.productDeleteGet)
	.post(productController.productDeletePost);
router.get("/product/:id", productController.productDetail);
router.get("/products", productController.productList);

module.exports = router;
