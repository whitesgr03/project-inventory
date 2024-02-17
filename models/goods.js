const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GoodsSchema = new Schema(
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
					return `/inventory/goods/${this._id}`;
				},
			},
		},
	}
);

const GoodsModel = mongoose.model("Goods", GoodsSchema);

module.exports = GoodsModel;
