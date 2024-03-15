const mongoose = require("mongoose");
const { unescape } = require("validator");

const Schema = mongoose.Schema;

const getImageName = name =>
	`${unescape(name).replace(/[^a-z0-9]+/gi, "-")}.jpg`;

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
		isUserCreated: { type: Boolean, required: true },
	},
	{
		virtuals: {
			encodeName: {
				get() {
					return encodeURIComponent(this.name);
				},
			},
			url: {
				get() {
					return `/inventory/product/${this._id}`;
				},
			},
			imageUrl: {
				get() {
					return `https://storage.googleapis.com/project-inventory-${
						this.isUserCreated ? "user" : "bucket"
					}/${this.encodeName}.jpg`;
				},
			},
			imageUrl_400: {
				get() {
					return `https://ik.imagekit.io/whitesgr03/project-inventory-${
						this.isUserCreated ? "user" : "bucket"
					}/tr:w-400,h-400/${this.encodeName}.jpg`;
				},
			},
			imageUrl_600: {
				get() {
					return `https://ik.imagekit.io/whitesgr03/project-inventory-${
						this.isUserCreated ? "user" : "bucket"
					}/tr:w-600,h-600/${this.encodeName}.jpg`;
				},
			},
		},
	}
);

const ProductModel = mongoose.model("Product", ProductSchema);

module.exports = ProductModel;
