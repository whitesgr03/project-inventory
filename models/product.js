import mongoose from "mongoose";
import unescape from "validator/lib/unescape.js";

const Schema = mongoose.Schema;

const getImageName = (name, lastModified) =>
	`${unescape(name).replace(/[^a-z0-9]+/gi, "-")}-${+lastModified}.jpg`;

const getImageUrl = (size, userCreated) =>
	`https://ik.imagekit.io/whitesgr03/project-inventory-${
		userCreated ? "user" : "bucket"
	}/tr:w-${size},h-${size}/`;

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
					return `/inventory/product/${this._id}`;
				},
			},
			imageUrl: {
				get() {
					return `https://storage.googleapis.com/project-inventory-${
						this.expiresAfter ? "user" : "bucket"
					}/${getImageName(this.name, this.lastModified)}`;
				},
			},
			imageUrl_300: {
				get() {
					return (
						getImageUrl("300", this.expiresAfter) +
						getImageName(this.name, this.lastModified)
					);
				},
			},
			imageUrl_400: {
				get() {
					return (
						getImageUrl("400", this.expiresAfter) +
						getImageName(this.name, this.lastModified)
					);
				},
			},
			imageUrl_600: {
				get() {
					return (
						getImageUrl("600", this.expiresAfter) +
						getImageName(this.name, this.lastModified)
					);
				},
			},
		},
	}
);

const ProductModel = mongoose.model("Product", ProductSchema);

export default ProductModel;
