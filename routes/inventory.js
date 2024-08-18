import express from "express";

const router = express.Router();

import * as categoryControllers from "../controllers/categoryController.js";
import * as productControllers from "../controllers/productController.js";

router.get("/", categoryControllers.index);

router
	.route("/category/create")
	.get(categoryControllers.categoryCreateGet)
	.post(categoryControllers.categoryCreatePost);
router
	.route("/category/:id/update")
	.get(categoryControllers.categoryUpdateGet)
	.post(categoryControllers.categoryUpdatePost);
router
	.route("/category/:id/delete")
	.get(categoryControllers.categoryDeleteGet)
	.post(categoryControllers.categoryDeletePost);
	
router.get("/category/:id", categoryControllers.categoryDetail);
router.get("/categories", categoryControllers.categoryList);

router
	.route("/product/create")
	.get(productControllers.productCreateGet)
	.post(productControllers.productCreatePost);
router
	.route("/product/:id/update")
	.get(productControllers.productUpdateGet)
	.post(productControllers.productUpdatePost);
router
	.route("/product/:id/delete")
	.get(productControllers.productDeleteGet)
	.post(productControllers.productDeletePost);
router.get("/product/:id", productControllers.productDetail);
router.get("/products", productControllers.productList);

export default router;
