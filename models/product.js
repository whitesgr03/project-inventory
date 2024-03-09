const mongoose = require("mongoose");

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
		isUserCreated: { type: Boolean, required: true },
	},
	{
		virtuals: {
			encodeName: {
				get() {
					return encodeURIComponent(this.name);
				},
			},
				get() {
					return `/inventory/product/${this._id}`;
				},
			},
			imageUrl: {
				get() {
					return `https://storage.googleapis.com/project-inventory-bucket/${this.name}.jpg`;
				},
			},
		},
	}
);

const ProductModel = mongoose.model("Product", ProductSchema);

module.exports = ProductModel;
