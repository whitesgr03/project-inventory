const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema(
	{
		name: { type: String, required: true, maxLength: 100 },
		description: { type: String, required: true },
		category: {
			type: Schema.Types.ObjectId,
			ref: "Category",
			required: true,
		},
		price: { type: Number, required: true },
		quantity: { type: Number, required: true },
	},
	{
		virtuals: {
			url: {
				get() {
					return `/inventory/product/${this._id}`;
				},
			},
		},
	}
);

const ProductModel = mongoose.model("product", ProductSchema);

module.exports = ProductModel;
