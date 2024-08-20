import mongoose from "mongoose";

import { getImageUrl } from "../utils/handleImage.js";

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
	{
		name: { type: String, required: true },
		description: { type: String, required: true },
		category: {
			type: Schema.Types.ObjectId,
			ref: "Category",
			required: true,
		},
		price: { type: Number, required: true },
		quantity: { type: Number, required: true },
		lastModified: { type: Date, required: true },
		expiresAfter: {
			type: Date,
			immutable: true,
		},
	},
	{
		virtuals: {
			url: {
				get() {
					return `/inventory/products/${this._id}`;
				},
			},
			imageUrl: {
				get() {
					return `https://storage.googleapis.com/${getImageUrl({
						product: this,
					})}`;
				},
			},
			imageUrl_300: {
				get() {
					return `https://ik.imagekit.io/whitesgr03/${getImageUrl({
						product: this,
						size: 300,
					})}`;
				},
			},
			imageUrl_400: {
				get() {
					return `https://ik.imagekit.io/whitesgr03/${getImageUrl({
						product: this,
						size: 400,
					})}`;
				},
			},
			imageUrl_600: {
				get() {
					return `https://ik.imagekit.io/whitesgr03/${getImageUrl({
						product: this,
						size: 600,
					})}`;
				},
			},
		},
	}
);

ProductSchema.index({ expiresAfter: 1 }, { expireAfterSeconds: 1 });

const ProductModel = mongoose.model("Product", ProductSchema);

export default ProductModel;
